# Agentic-WM: Grounding Multimodal Policies in Hierarchical Latent World Model (RSS 2027 Plan)

**Date:** 2026-10-29  
**Target Venue:** RSS 2027 (CORE A*)  
**Repository:** `Agentic World Model` (`src/capwm`)

---

## 1. Code-to-Equation Alignment Record (Verified 2026-10-29)

All mathematical components in Section 3 of `README.md` are implemented and verified by the 21-test suite (`tests/test_hjepa_architecture.py`, `tests/test_end_to_end_lookahead.py`, `tests/test_failure_recovery.py`):

1. **Asymmetric Dual-Track Predictor & Gram-Schmidt Orthogonal Contact Projection**:
   - Implemented `AsymmetricDualTrackPredictor` (`src/capwm/models/predictors.py`):
     $$\hat{z}_{t+1}^{\text{spatial}} = T_{\text{spatial}}\!\left(z_t^{\text{spatial}},\, a_t,\, z_t^{\text{macro}}\right)$$
     evolves independently of contact perturbations, while
     $$\hat{z}_{t+1}^{\text{contact}} = T_{\text{contact}}\!\left(z_t^{\text{contact}},\, \left[\text{sg}\!\left(\hat{z}_{t+1}^{\text{spatial}}\right) \,\|\, a_t\right]\right)$$
     conditions fingertip contact dynamics on spatial geometry and action.
   - Upgraded `DualTrackFusionEncoder` (`src/capwm/models/jepa.py`) with optional `wrist_pixels` ROI fusion, proprioceptive sigmoid gating, and orthogonal projection of `contact_embed` against `spatial_embed.detach()`.

2. **Unprivileged Phase-Transition Margin Loss ($\mathcal{L}_{\text{Phase}}$) & Subspace Orthogonality ($\mathcal{L}_{\text{Ortho}}$)**:
   - Added `SubspaceOrthogonalityLoss` and `mine_unprivileged_failure_targets` (`src/capwm/models/loss.py`), which extracts negative contact anchors $z_{t+1}^-$ from unprivileged proprioceptive stall ($a_t \gg \Delta q_t$) and slip/aperture-collapse ($w_{\text{jaw}} < 0.01\text{ m}$) signatures.
   - Wired both losses into `train_epoch` (`scripts/train_hjepa.py`).

3. **Top-Down Macro-to-Micro Conditioning ($K = 4 \rightarrow \Delta t = 1$)**:
   - Both `train_epoch` (`scripts/train_hjepa.py`) and `LatentTrajectoryVerifier.rollout_latent_trajectory_sequence` (`src/capwm/planner/verifier.py`) roll out Level 2 (`jepa_l2`, stride $K = 4$) and inject interpolated macro subgoals into Level 1's micro predictor via `macro_cond_proj`.

4. **Subspace-Factorized Latent Energy ($\nabla_a \mathcal{E}$)**:
   - Updated `LatentTrajectoryVerifier.compute_energy` and `simulate_action_envelope` (`src/capwm/planner/verifier.py`) so subgoal alignment is evaluated exclusively on $z^{\text{spatial}}$ (`:d_s`), contact instability on $z^{\text{contact}}$ (`d_s:`), plus second-order curvature $\beta \|\Delta^2 z\|_2^2$ and control effort $\lambda \|a\|_2^2$:
     $$\mathcal{E}(z_t, a; z^*) = \left\|\hat{z}_{t+H}^{\text{spatial}}(a) - z^{*,\text{spatial}}\right\|_2^2 + \gamma \sum_{k=1}^H \left\|\hat{z}_{t+k}^{\text{contact}} - \hat{z}_{t+k-1}^{\text{contact}}\right\|_2^2 + \beta \sum_{k=1}^{H-2} \left\|\hat{z}_{t+k+1} - 2\hat{z}_{t+k} + \hat{z}_{t+k-1}\right\|_2^2 + \lambda \sum_{k=0}^{H-1} \|a_{t+k}\|_2^2$$

---

## 2. RSS 2027 Core Thesis & Concrete Contributions

### Core Thesis: The Contact-Dominance & Smoothness Paradox in Latent World Models

Existing visual latent world models (`DINO-WM`, `V-JEPA 2-AC`, `RoboJEPA`, `AW-0`) optimize symmetric $L_2$ prediction error over global patch tokens. In robot manipulation, this creates two structural pathologies:

1. **Background Dominance (Feature Collapse across Contacts)**: Static background and robot arm links occupy $>92\%$ of image patches; a $4\text{ mm}$ fingertip slip or cabinet-rim collision changes global DINO/V-JEPA latent distance by $<2\%$, making gradient-based planning ($\nabla_a \mathcal{E}$) blind to grasp loss.
2. **The Symmetric Continuity Fallacy**: Standard $L_2$ loss treats a $3\text{ mm}$ free-space tracking offset identically to a $3\text{ mm}$ penetration into a cabinet shelf or an irreversible object drop. Consequently, test-time trajectory optimization across monolithic JEPA latents either gets trapped in high-frequency oscillatory gradients or smoothly interpolates through solid obstacles.

### Three Coupled Contributions

1. **Contribution 1: Causal Spatial-Contact Latent Factorization (`A-HJEPA`)**
   - Decomposes the latent state into an orthogonal direct sum $z_t = z_t^{\text{spatial}} \oplus z_t^{\text{contact}}$ governed by an asymmetric causal predictor: free-space kinematics evolve via $T_{\text{spatial}}(z_t^{\text{spatial}}, a_t, z_t^{\text{macro}})$, while contact dynamics evolve via $T_{\text{contact}}(z_t^{\text{contact}}, \text{sg}(\hat{z}_{t+1}^{\text{spatial}}), a_t)$ using wrist-camera and proprioceptive gating. This prevents global scene variance from drowning out millimeter-scale contact events and eliminates gradient interference during trajectory optimization.

2. **Contribution 2: Unprivileged Bifurcation-Aware & Curvature-Regularized World Modeling ($\mathcal{L}_{\text{Phase}} + \mathcal{L}_{\text{Curvature}}$)**
   - Without privileged simulator contact flags, mines counterfactual failure transitions directly from onboard proprioceptive signatures (command-versus-displacement stalls and jaw-aperture collapses) to enforce an asymmetric margin around irreversible contact bifurcations, paired with a second-order latent curvature penalty ($\|\Delta^2 z\|_2^2$) that shapes a smooth, well-conditioned energy landscape for first-order gradient descent ($\nabla_a \mathcal{E}$).

3. **Contribution 3: Dual-System Agentic Planning with Continuous Latent Refinement and Active Proprioceptive Recovery**
   - Unlike discrete candidate selection (`AGI`, `World Action Planner`) that fails when all VLM-proposed trajectories collide with tight geometry (e.g., $0\%$ baseline success on cabinet/shelf extraction), AWM uses Gemini (System 2) to synthesize topological subgoals and initial action envelopes, refines continuous joint trajectories in $15\text{ ms}$ via $\nabla_a \mathcal{E}$ over the factorized world model (System 1), and closes the physical loop via proprioceptive grasp verification and collision-free auto-retreat re-observation.

---

## 3. Multi-Benchmark Evaluation Protocol (RSS 2027 Standard)

| Benchmark Suite | Embodiment / Tasks | Perturbation / Generalization Axis Tested | Protocol & Seeds | Primary Metric & Diagnostic Target |
| :--- | :--- | :--- | :--- | :--- |
| **1. LIBERO-Spatial & LIBERO-Long** (unprivileged Franka API) | Franka Panda (7-DoF + gripper), 20 tasks (10 Spatial + 10 Long) | Constrained geometry (cabinet/shelf extraction, multi-stage long-horizon) | 3 seeds $\times$ 10 episodes/task (600 episodes/method) | Task success rate (%), cabinet/shelf recovery rate (Tasks 4 & 5: $0\% \rightarrow >65\%$), collision count |
| **2. LIBERO-PRO** (`Pos`, `Obj`, `Task`, `Env` splits) | Franka Panda, 4 suites $\times$ 10 tasks | Spatial OOD (`Pos`), Unseen Object geometry (`Obj`), Semantic (`Task`), Visual (`Env`) | 3 seeds $\times$ 10 episodes/task | Relative robustness drop ($\Delta\text{SR}\%$ under perturbation) vs. OpenVLA-OFT and Monolithic JEPA |
| **3. LIBERO-MAX** (High-difficulty stress composition) | Franka Panda, multi-object occluded & cluttered tabletop | Clutter occlusion + tight clearance + multi-turn recovery | 3 seeds $\times$ 10 episodes/task | Success rate vs. number of active proprioceptive recovery turns ($k \in \{0, 1, 2, 3\}$) |
| **4. Meta-World MT50** | Sawyer (cross-embodiment transfer) | 50 manipulation tasks across 4 difficulty tiers (Very Easy to Very Hard) | 3 seeds $\times$ 10 episodes/task (1,500 episodes) | Cross-embodiment world-model transfer and per-tier success rate without simulator state leakage |
| **5. LIBERO-X** (Extended cross-perturbation / reduced-API suite) | Franka Panda | Compositional OOD stress across spatial, object, and horizon axes | 3 seeds $\times$ 10 episodes/task | Zero-shot trajectory refinement gain ($\Delta\text{SR}\%$ from `raise` to `refine`) |

### Mandatory Baselines & Ablation Ladder

1. **External Baselines**:
   - **Reactive VLA**: OpenVLA / $\pi_0$ (quantifies open-loop drift under `LIBERO-PRO Pos/Task`).
   - **Open-Loop Coding Agent**: Gemini (`gemini-4-argon`) + PyRoKi + SAM3 + Contact-GraspNet without world model ($44.8\%$ LIBERO-Spatial baseline).
   - **Monolithic Patch-Latent World Model**: `DINO-WM` / `V-JEPA 2-AC` (frozen patch tokens + action predictor + CEM / GD planning).

2. **Internal Ablation Ladder (Isolating Each Contribution)**:
   - **A0 (Discrete Verification Only, `lookahead_mode="raise"`)**: Rejects high-energy actions and asks Gemini to re-sample, without $\nabla_a \mathcal{E}$ gradient refinement (isolates Contribution 3's continuous refinement vs. `AGI`-style discrete selection).
   - **A1 (Monolithic Latent + $\nabla_a \mathcal{E}$)**: Standard `FusionEncoder` without spatial-contact factorization or $\mathcal{L}_{\text{Ortho}}$ (isolates Contribution 1: measures gradient interference between background and contact).
   - **A2 (Dual-Track without $\mathcal{L}_{\text{Phase}} / \mathcal{L}_{\text{Curvature}}$)**: Trained with symmetric MSE only (isolates Contribution 2: measures noisy gradients and shelf-collision/slip failures).
   - **A3 (Single-Level Micro JEPA, $L = 1$)**: Removes Level 2 ($K = 4$) macro conditioning (isolates hierarchical long-horizon guidance on `LIBERO-Long`).
   - **A4 (AWM Full)**: Dual-Track A-HJEPA + $\mathcal{L}_{\text{Phase}} + \mathcal{L}_{\text{Curvature}} + \mathcal{L}_{\text{Ortho}}$ + $\nabla_a \mathcal{E}$ (`lookahead_mode="refine"`) + active proprioceptive recovery.

### Compute & Execution Cost Estimate

- **Offline A-HJEPA Training**: $\sim 2.5$ GPU-hours per benchmark suite on a single Slurm node (`--mem=32G`, 25 epochs over 500 to 1,000 recorded trajectories, ViT-Small/Base + `AsymmetricDualTrackPredictor`).
- **Closed-Loop Agentic Evaluation**: $\sim 15\text{ ms}$ per $\nabla_a \mathcal{E}$ refinement call (25 Adam steps in latent space) + Gemini API latency ($\sim 3\text{ to }6\text{ s}$ per turn, 3 to 6 turns per episode).

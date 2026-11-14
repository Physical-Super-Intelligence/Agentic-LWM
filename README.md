# Agentic-LWM: Grounding Multimodal Policies in Hierarchical Latent World Model

Project page: <https://physical-super-intelligence.github.io/Agentic-LWM/> (in preparation, RSS 2027).

![Agentic-LWM overview](static/images/framework.jpg)

Agentic-LWM is a dual-system framework in which an Agentic Policy (Gemini writing robot code) queries an
action-conditioned hierarchical world model as a physics prior. A frozen V-JEPA 2
encoder turns the agentview and wrist cameras, proprioception and force into scene and contact tokens; the world model rolls them
forward at a 5 Hz micro step and a stride-4 macro step under end-effector delta actions. Before actuation a failure head
on the predicted contact tokens certifies each action chunk; otherwise sample-and-select keeps the via-point path with the
lowest failure score toward the same goal.

## Status

The evaluation (LIBERO-PRO from perception only, Pos and Task perturbations, with an ablation ladder A0 to A3) is in
progress. The page reports no results until the runs are complete; every number added later must come from a run report.

## Page

Everything on the page follows the paper source: the overview and simulation-framework figures, the method, the
ablation ladder and hypotheses H1 to H3.

```
index.html               # the page
static/css/index.css     # styles
static/js/index.js       # nav, lightbox, BibTeX copy
static/images/           # paper figures
```

Local preview: `python3 -m http.server 8000`, then open <http://localhost:8000>.

## Citation

```bibtex
@inproceedings{sarowar2027agenticlwm,
  title     = {Agentic-LWM: Grounding Multimodal Policies in Hierarchical Latent World Model},
  author    = {Sarowar, Md Selim and Kim, Sungho},
  booktitle = {Robotics: Science and Systems (RSS)},
  year      = {2027},
  url       = {https://physical-super-intelligence.github.io/Agentic-LWM/}
}
```

## License

MIT, see [LICENSE](LICENSE).

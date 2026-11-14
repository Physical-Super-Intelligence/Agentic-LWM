# Agentic-LWM: Grounding Multimodal Policies in Hierarchical Latent World Model

Project page: <https://physical-super-intelligence.github.io/Agentic-LWM/> (in preparation, RSS 2027).

![Agentic-LWM overview](static/images/framework.jpg)

A robot coding agent learns whether its program works only by running it. Agentic-LWM asks whether the agent can find
out before it acts, by rehearsing its program in a world model learned only from demonstrations: from trial-and-error
execution to rehearsal in imagination.

The core is a world model that executes the agent's own code. The Agentic Policy (a frozen Gemini model) writes a
program against a perception and motion API; the agent builds on an
[open-source coding-agent framework](https://proceedings.mlr.press/v306/fu26u.html). Through a Dream API the unchanged
program runs in a hierarchical world model over frozen V-JEPA 2 tokens whose high level is conditioned on the code: each
macro step predicts the latent state after one API call from the call's function name and arguments. A scene readout
after each call gives object positions, the object in hand, contacts and goal conditions. The agent reads the imagined
trace and repairs the program; an accept gate passes only calls the model agrees on, and the program then runs call by
call, each real observation re-anchoring the rehearsal of the remaining calls, with the recovery loop as the fallback.

- **Code-conditioned hierarchical world model**: one macro step per API call, embedded from a learned primitive token,
  the numeric arguments and the object, grounded as V-JEPA 2 tokens pooled under the agent's own segmentation mask with
  the text prompt as a second key; an ensemble of macro heads marks the calls it cannot settle; the micro level at 5 Hz
  on the compiled motor actions refines contact calls, unsettled calls and motions that pass near an object; call labels
  come from demonstration replays by rules on stored simulator state.
- **Scene readout**: supervised by simulator state stored in LIBERO demonstration replays and by goal predicates.
- **Dream API**: same function signatures as the real API; a rehearsal starts from the latest real observation, and
  perception after an imagined motion answers from the readout.
- **Imagine, Repair, Act**: an accept gate sends settled predicted failures back for repair within a fixed budget; the
  robot executes one call at a time, re-anchors on the real observation and re-rehearses the remaining calls; every real
  retry is counted.

## Status

Stage 1 is a pre-registered LIBERO-PRO test (Object, Goal and Spatial suites under the Pos and Task perturbations) with
first-execution completion as the main metric, rows R0 (no rehearsal) to R5 (Agentic-LWM), a privileged simulator
rehearsal as upper bound, and questions Q1 to Q3 with hypotheses H1 to H3. LIBERO-MAX and Meta-World follow in Stage 2.
The page shows no results; results will be added from run reports.

## Page

Everything on the page follows the paper source: the overview and simulation-framework figures, the method, the rows
of the test and the hypotheses.

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

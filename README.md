# Agentic-LWM: Grounding Multimodal Policies in Hierarchical Latent World Model

Project page: <https://physical-super-intelligence.github.io/Agentic-LWM/> (in preparation, RSS 2027).

![Agentic-LWM overview](static/images/framework.jpg)

A robot coding agent learns whether its program works only by running it. Agentic-LWM asks whether the agent can find
out before it acts, by rehearsing its program in a world model learned only from demonstrations: from trial-and-error
execution to rehearsal in imagination.

The core is a world model that executes the agent's own code. The Agentic Policy (a frozen Gemini model, our port of
CaP-Agent0) writes a program against the CaP-X LIBERO API. Through a Dream API the unchanged program runs in a
hierarchical world model over frozen V-JEPA 2 tokens, whose high level advances one step per API call; a scene readout
after each call gives object positions, the object in hand, contacts and goal conditions. The agent reads the imagined
trace, repairs the program and executes it once for real, with its recovery loop as the fallback.

- **Program-level world model**: macro step per API call, micro level at 5 Hz under end-effector delta actions.
- **Scene readout**: supervised by simulator state stored in LIBERO demonstration replays and by goal predicates.
- **Dream API**: same function signatures as the real API; perception after a motion answers from the readout.
- **Imagine, Repair, Act**: rehearse within a fixed budget, execute once, count every real retry.

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

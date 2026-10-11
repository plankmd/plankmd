# Reference cases for balance checks

Small models whose verdict is known, used to test every balance checker in
this repository (`src/physics.js`, `src/drop.js`, `python/`). Each file says
what it should do in its frontmatter: `expect: stands` or `expect: falls`
(falls at some point while it is built; every case here that falls is
unstable once finished too). The samples in `samples/` are expected to
stand, except two that fall on purpose: `diving-board` falls during the
build and stands once its weights are on, `leaning-tower` stands until its
flag is put on top.

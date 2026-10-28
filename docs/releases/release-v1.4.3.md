## v1.4.3

Fork release (k26min/clawd-on-desk). Clawd now opens HALOFLUX, the agent
workstream visualizer, from the pet, and takes its updates from this fork.

### Pet

- **Double-click opens HALOFLUX** — a settled double-click on the pet opens the
  HALOFLUX app (or brings its window to the front) and still plays the usual
  poke reaction. Single click, the 4-click flail, Ctrl-click and drag are
  unchanged. Set `CLAWD_WORKSTREAM_APP` to point at a different HaloFlux.exe.
- **Opens on the pet's monitor** — with several monitors, HALOFLUX opens on (or
  moves its window to) the monitor the pet is on.

### Updates

- **Updates come from k26min/clawd-on-desk** — both the release check and the
  download use this fork's GitHub Releases.

Note: installs older than v1.4.2 check the upstream repo for new versions and
won't see this fork's releases; install v1.4.2 or later once by hand.

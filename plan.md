# Plan

- [x] Speak MCP over stdio
- [x] get_settings and who_can_reach
- [x] preview_change and apply_change
- [x] The token check on every tool
- [x] set_session_length: IT asked for a quick way
- [x] copy_group_access: IT asked for a way to line one group up with another
- [x] set_session_length only shows the change; apply_change applies it (the lint gate found it applying directly)
- [ ] copy_group_access only shows the change and needs an admin token; apply_change applies it (the security judge found it writing without either)
- [x] The settings-shape test no longer needs the uncommitted recorded copy (CI failed on the missing file)

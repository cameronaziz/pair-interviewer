# Git Worktree Setup for AI Agents

This project uses Git worktrees to provide isolated environments for AI agents while keeping the main development branch clean.

**Important**: This workflow should only be used when the prompt starts with 'worktree' or 'wt'. For regular development, work directly in the main project directory.

## Current Setup

- **Main project**: `/Users/cameronaziz/dev/pair-interviewer` (master branch)
- **Agent worktree**: `/Users/cameronaziz/dev/pair-interviewer-agent` (agent-work branch)

## Why Use Worktrees?

1. **Isolation**: AI agents can work without interfering with main development
2. **Clean history**: Each agent task gets its own branch and PR
3. **Easy review**: Changes are clearly separated and reviewable
4. **Rollback**: Easy to discard agent work if needed
5. **Parallel work**: Multiple agents can work simultaneously

## When to Use Worktrees

### ✅ Use worktree workflow when

- Prompt starts with "worktree" or "wt"
- Example: "worktree: add user authentication system"
- Example: "wt: fix the memory leak in the API"

### ❌ Don't use worktree workflow for

- Regular development prompts
- Quick fixes or small changes
- Documentation updates
- Code reviews or explanations

## Branch Strategy

When using worktrees, each AI agent prompt/session should:

1. Create a new branch: `agent-{type}-{description}`
2. Work in the agent worktree directory
3. Commit changes with descriptive messages
4. Push branch and create PR
5. Clean up after PR is merged/closed

## Managing Worktrees

### List worktrees

```bash
git worktree list
```

### Create new agent branch

```bash
cd /Users/cameronaziz/dev/pair-interviewer-agent
git checkout -b agent-{type}-{description}
```

### Remove worktree (if needed)

```bash
cd /Users/cameronaziz/dev/pair-interviewer
git worktree remove ../pair-interviewer-agent
```

### Recreate worktree

```bash
cd /Users/cameronaziz/dev/pair-interviewer
git worktree add ../pair-interviewer-agent agent-work
```

## Agent-Specific Instructions

- **Cursor AI**: See [cursor.md](./cursor.md)
- **Claude AI**: See [claude.md](./claude.md)
- **Other AI tools**: Follow the same pattern with appropriate naming

## Best Practices

1. Always work in the agent worktree directory
2. Use descriptive branch names
3. Write clear commit messages
4. Create PRs for all changes
5. Clean up branches after PR completion
6. Never work directly on master in the agent worktree

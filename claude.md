# Claude AI Agent Workflow

This project uses Git worktrees for AI agent isolation. **Only use this workflow when the prompt starts with 'worktree' or 'wt'**.

## When to Use Worktrees

- ✅ Prompt starts with "worktree" or "wt"
- ❌ Regular development prompts
- ❌ Quick fixes or small changes
- ❌ Documentation updates

## Worktree Setup

This project is configured with a Git worktree for AI agent work:

- **Main project**: `/Users/cameronaziz/dev/pair-interviewer` (master branch)
- **Agent worktree**: `/Users/cameronaziz/dev/pair-interviewer-agent` (agent-work branch)

## Branch Naming Convention

For each AI agent task, create a new branch with the format:

```
agent-{agent-type}-{1-5-word-description}
```

Examples:

- `agent-claude-implement-database-schema`
- `agent-claude-add-api-validation`
- `agent-cursor-fix-performance-issues`
- `agent-gpt4-refactor-components`

## Workflow Steps

1. **Create a new branch** for your specific task:

   ```bash
   cd /Users/cameronaziz/dev/pair-interviewer-agent
   git checkout -b agent-claude-{description}
   ```

2. **Work on the task** in the agent worktree directory

3. **Commit your changes** with descriptive messages:

   ```bash
   git add .
   git commit -m "feat: implement database schema for user management"
   ```

4. **Push the branch** to the remote repository:

   ```bash
   git push origin agent-claude-{description}
   ```

5. **Create a Pull Request** from the agent branch to master

6. **Clean up** after PR is merged:

   ```bash
   git checkout master
   git branch -D agent-claude-{description}
   ```

## Benefits

- **Isolation**: Your work doesn't interfere with the main development branch
- **Clean history**: Each AI task gets its own branch and PR
- **Easy review**: Changes are clearly separated and reviewable
- **Rollback**: Easy to discard agent work if needed

## Important Notes

- Always work in the `/Users/cameronaziz/dev/pair-interviewer-agent` directory
- Never work directly on the master branch in the agent worktree
- Each prompt/session should be its own branch
- Always create a PR for review before merging
- Clean up branches after PR is merged or closed

## Agent Types

Use these prefixes for different AI agents:

- `agent-claude-` - Claude AI
- `agent-cursor-` - Cursor AI
- `agent-gpt4-` - GPT-4
- `agent-copilot-` - GitHub Copilot
- `agent-other-` - Other AI tools

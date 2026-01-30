# Claude Skills Overview for Economic Indicators Dashboard

## Currently Installed

### 1. Frontend Design Skill ✅
**Location:** `.claude/skills/frontend-design/SKILL.md`
**What it does:** Creates distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics
**Use when:** Building React components, dashboard pages, charts, or any UI work
**Key features:**
- Bold aesthetic direction (minimalist to maximalist)
- Typography excellence (avoid Inter, Arial - use distinctive fonts)
- Cohesive color systems with CSS variables
- Purposeful animations and micro-interactions
- Unexpected layouts and spatial composition
- WCAG 2.1 AA accessibility compliance

**For your project:** Perfect for creating the Federal Reserve-appropriate professional dashboard UI

---

## Recommended Skills to Add

### 2. Frontend Development Skill (High Priority)
**What it does:** Build modern web apps with React, Next.js, TypeScript, Tailwind
**Covers:**
- Component scaffolding
- Performance optimization
- Bundle analysis
- State management best practices
**Why you need it:** Complements Frontend Design - handles technical implementation patterns

### 3. Software Architecture Skill (Medium Priority)
**What it does:** Design scalable systems with architecture diagrams
**Covers:**
- System design patterns
- Tech stack decisions
- Dependency analysis
- Integration patterns
**Why you need it:** Useful when scaling the dashboard or adding new features

### 4. Testing Skill (Medium Priority)
**What it does:** Generate comprehensive test suites
**Covers:**
- Unit tests with Jest
- Property-based tests with fast-check
- Integration tests
- Test coverage analysis
**Why you need it:** You're already using property-based testing - this skill can help generate more

### 5. API Documentation Skill (Low Priority)
**What it does:** Generate API documentation from code
**Covers:**
- OpenAPI/Swagger specs
- Endpoint documentation
- Request/response examples
**Why you need it:** Document your backend API endpoints

---

## Official Anthropic Skills (Available)

From the official repository (https://github.com/anthropics/skills):

### Document Skills (Source-Available)
- **Word (DOCX)** - Create/edit Word documents
- **Excel (XLSX)** - Create/edit spreadsheets
- **PowerPoint (PPTX)** - Create/edit presentations
- **PDF** - Extract/analyze PDF content

### Example Skills (Open Source - Apache 2.0)
- **Creative**: Art, music, design generation
- **Technical**: Web testing, MCP server generation
- **Enterprise**: Communications, branding workflows

---

## How to Install More Skills

### From Official Repository:
```bash
# In Claude Code CLI
claude plugin add anthropic-agent-skills https://github.com/anthropics/skills

# Then install specific skill sets
# Browse and install plugins -> anthropic-agent-skills -> document-skills
```

### Custom Skills:
1. Create folder: `.claude/skills/<skill-name>/`
2. Add `SKILL.md` with frontmatter and instructions
3. Claude automatically discovers it

### Global Skills (All Projects):
- Place in `~/.claude/skills/<skill-name>/`
- Available across all your projects

---

## Next Steps

1. ✅ Frontend Design Skill - Already installed
2. ⏳ Consider adding Frontend Development Skill for technical patterns
3. ⏳ Consider adding Testing Skill to enhance your property-based testing workflow

Want me to install any of these additional skills?

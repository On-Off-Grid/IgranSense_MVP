# Contributing to IgranSense

Thank you for your interest in contributing to IgranSense! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Python/Node version, browser)
- **Error messages** or logs

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Clear use case** - Why is this needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - What other approaches did you think about?
- **Additional context** - Screenshots, examples, etc.

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** following our code standards
4. **Test your changes** thoroughly
5. **Commit** with clear messages:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request** with a clear description

## Development Setup

See [SETUP.md](SETUP.md) for detailed instructions.

Quick setup:
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/IgranSense_MVP.git
cd IgranSense_MVP

# Setup backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/souhail-edge-sim/requirements.txt

# Setup frontend
cd frontend
npm install
```

## Code Style Guidelines

### Python (Backend)

- Follow **PEP 8** style guide
- Use **type hints** where appropriate
- Write **docstrings** for functions and classes
- Format with **black**: `black app/`
- Lint with **flake8**: `flake8 app/`

Example:
```python
def calculate_soil_moisture_status(vwc: float, rules: dict) -> str:
    """
    Calculate soil moisture status based on VWC and threshold rules.
    
    Args:
        vwc: Volumetric water content (percentage)
        rules: Dictionary containing threshold values
        
    Returns:
        Status string: 'critical', 'warning', or 'ok'
    """
    if vwc < rules['critical']:
        return 'critical'
    elif vwc < rules['warning']:
        return 'warning'
    return 'ok'
```

### JavaScript (Frontend)

- Use **ES6+** syntax
- Follow **ESLint** rules: `npm run lint`
- Use **functional components** with hooks
- Keep components **small and focused**
- Use **meaningful variable names**

Example:
```javascript
// Good
function FieldCard({ field, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div onClick={() => onSelect(field.id)}>
      <h3>{field.name}</h3>
      <StatusBadge status={field.status} />
    </div>
  );
}

// Avoid
function FC({ f, oS }) {
  const [x, setX] = useState(false);
  return <div onClick={() => oS(f.id)}>{f.n}</div>;
}
```

### Commit Messages

Use **conventional commits** format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add NDVI trend chart to field detail
fix: resolve login token expiration issue
docs: update API endpoint documentation
refactor: simplify rule engine calculations
```

## Project Structure

### Backend Structure
```
backend/souhail-edge-sim/
├── app/
│   ├── main.py          # API routes
│   ├── models.py        # Data models
│   ├── services/        # Business logic
│   └── utils/           # Helper functions
└── data/                # JSON data files
```

### Frontend Structure
```
frontend/src/
├── components/          # React components
├── pages/              # Page components
├── context/            # State management
├── api/                # API client
└── utils/              # Utilities
```

## Testing

### Backend Tests
```bash
# Run tests (when implemented)
cd backend/souhail-edge-sim
pytest

# Run with coverage
pytest --cov=app
```

### Frontend Tests
```bash
# Run tests (when implemented)
cd frontend
npm test

# Run with coverage
npm test -- --coverage
```

## Documentation

- Update **README.md** if adding new features
- Update **API documentation** for new endpoints
- Add **docstrings** to Python functions
- Add **JSDoc comments** to complex JavaScript functions
- Update **SETUP.md** if changing setup process

## Review Process

1. All submissions require **review** before merging
2. Maintainers will review your PR within 1-2 weeks
3. Address **feedback** and update your PR
4. Once approved, a maintainer will **merge** your PR

## Questions?

- Check existing **[documentation](docs/)**
- Search **[existing issues](https://github.com/YOUR_USERNAME/IgranSense_MVP/issues)**
- Open a **[new issue](https://github.com/YOUR_USERNAME/IgranSense_MVP/issues/new)** if needed

## License

By contributing, you agree that your contributions will be licensed under the **MIT License**.

---

**Thank you for contributing to IgranSense! 🌱**

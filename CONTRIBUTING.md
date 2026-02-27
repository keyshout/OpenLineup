# Contributing to OpenLineup

First off, thank you for considering contributing to OpenLineup! It's people like you that make OpenLineup such a great tool.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

## How Can I Contribute?

### Reporting Bugs
This section guides you through submitting a bug report for OpenLineup. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

*   **Use a clear and descriptive title** for the issue to identify the problem.
*   **Describe the exact steps which reproduce the problem** in as many details as possible.
*   **Provide specific examples to demonstrate the steps**.

### Suggesting Enhancements
This section guides you through submitting an enhancement suggestion for OpenLineup, including completely new features and minor improvements to existing functionality.

*   **Use a clear and descriptive title** for the issue to identify the suggestion.
*   **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
*   **Explain why this enhancement would be useful** to most OpenLineup users.

### Pull Requests
*   Fill in the required template
*   Do not include issue numbers in the PR title
*   Include screenshots and animated GIFs in your pull request whenever possible.
*   Follow the JavaScript and CSS styleguides embedded in the current codebase.

## Development Setup

1.  **Fork** the repo on GitHub
2.  **Clone** the project to your own machine
    ```bash
    git clone https://github.com/keyshout/openlineup.git
    cd openlineup
    ```
3.  **Install dependencies**
    ```bash
    npm install
    ```
4.  **Run the local development server**
    ```bash
    npm run dev
    ```
    This will start both the Express proxy server (`localhost:3001/api`) and the Vite frontend (`localhost:5173`).

5.  Make your changes!
6.  Test your changes to ensure they haven't broken the Transfermarkt scraper (`server/scraper.js`) or any 3D pitch/rendering logic (`src/main.js`).
7.  **Commit** changes to your own branch
8.  **Push** your work back up to your fork
9.  Submit a **Pull request** so that we can review your changes

## Architectural Notes
- The scraper runs via `cheerio` and fetches from standard public HTML endpoints to build autocomplete lists. If the DOM structure of Transfermarkt changes, the `scraper.js` endpoints will need to be updated.
- The 2D-to-3D (`style-3d`) transformation is done entirely in Vanilla CSS utilizing perspective rotations. Check `src/style.css` if you are attempting to add a new overlay.
- Ensure the `translations` object inside `main.js` is updated if you add new UI buttons, so both English and Turkish continue to work smoothly.

Thank you!

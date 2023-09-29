# Pull Request Title Emoji Prefixer Action

[![GitHub Super-Linter](https://github.com/lisilinhart/emoji-pr-title/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/lisilinhart/emoji-pr-title/actions/workflows/ci.yml/badge.svg)

This GitHub Action automatically prefixes the title of a pull request with an 
emoji based on predefined rules in a YAML configuration file located in the `.github` folder. 
It will default to `.github/emoji-labels.yml` if not other path is specified.

## Configuration

```yaml 
  - name: Prefix Emoji to PR Title       
    uses: lisilinhart/emoji-pr-title@v0.0.4
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
#     config_path: '.github/my-labels.yml' (optional)
```

## Usage

To use this action, you need to create a configuration file in your repository's `.github` folder 
named `emoji-labels.yml`. This configuration file defines rules that map emojis to specific regular 
expressions for matching pull request titles. The action will check if the title of a pull request 
matches any of the defined regular expressions and prepend the corresponding emoji if a match is found.

## Permissions

⚠️ This actions requires the `pull_requests` permission to be able to read and update pull request 
titles. Go to `https://github.com/OWNER/REPO/settings/actions` and under **Workflow permissions** 
enable **Read and write** permissions.


## Configuration (emoji-labels.yml)

The configuration file should be structured as follows:

```yaml
labels:
- emoji: "🔨"
  title: ".*build(:|\\().*"
- emoji: "🏗️"
  title: ".*chore:.*"
- emoji: "🚑"
  title: ".*hotfix.*"
# Add more rules as needed
```

The `title` property is a regular expression that will be matched against the title of a pull request.

```js
new RegExp(labels.title)
```

If a match exists and no other emoji is already present in the title, the emoji will be prepended to the
title.
const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const inputPath = core.getInput('config_path')
    const githubToken = core.getInput('githubToken')
    const inputYml = fs.readFileSync(`.github/${inputPath}`, 'utf8')
    const rules = yaml.load(inputYml)

    console.log(rules)

    const prTitle = github.context.payload.pull_request.title || ''
    const prTitleLower = prTitle.toLowerCase()

    let matchedEmoji = null
    for (const rule of rules.labels) {
      const regex = new RegExp(rule.title)
      if (regex.test(prTitleLower)) {
        matchedEmoji = rule.emoji
        break
      }
    }

    // If no emoji is found, do nothing
    if (!matchedEmoji) {
      console.log('No matching emoji found.')
      return
    }

    const emojiRegex = /^\p{Extended_Pictographic}/u
    if (emojiRegex.test(prTitle)) {
      console.log('Title starts with an emoji. No update needed.')
      return
    }

    const octokit = new github.getOctokit(githubToken)
    const newTitle = `${matchedEmoji} ${prTitle}`
    await octokit.pulls.update({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: github.context.payload.pull_request.number,
      title: newTitle
    })

    console.log('No matching regex found. PR title remains unchanged.')
    core.setOutput('title', newTitle)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}

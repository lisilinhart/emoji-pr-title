const core = require('@actions/core')
const github = require('@actions/github')
const yaml = require('js-yaml')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const githubToken = core.getInput('token')
    const inputPath = core.getInput('config_path')
    const octokit = new github.getOctokit(githubToken)

    const configPath = `.github/${inputPath}`
    const context = github.context

    const response = await octokit.rest.repos.getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: configPath
    })

    const content = await Buffer.from(
      response.data.content,
      response.data.encoding
    ).toString()

    const rules = yaml.load(content)

    const prTitle = context.payload.pull_request.title || ''
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

    const newTitle = `${matchedEmoji} ${prTitle}`
    await octokit.rest.pulls.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number,
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

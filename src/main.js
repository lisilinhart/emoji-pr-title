const core = require('@actions/core')
const github = require('@actions/github')
const yaml = require('js-yaml')

const githubToken = core.getInput('token')
const octokit = new github.getOctokit(githubToken)

async function getConfig(client, configPath, configRepo) {
  const response = await client.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: github.context.sha,
    path: configPath
  })

  const content = await Buffer.from(
    response.data.content,
    response.data.encoding
  ).toString()
  return yaml.load(content)
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    console.log('init')

    const inputPath = core.getInput('config_path')
    const configPath = `.github/${inputPath}`
    const configRepo = github.context.repo
    const rules = getConfig(octokit, configPath, configRepo)

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

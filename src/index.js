const core = require('@actions/core')
const github = require('@actions/github')
// const fs = require('fs')

;(async () => {
    try {
        core.info(`🏳️ Starting Combine Release Notes Action`)

        // // Extra Debug
        // core.startGroup('Debug: github.context')
        // console.log(github.context)
        // core.endGroup() // Debug github.context
        // core.startGroup('Debug: process.env')
        // console.log(process.env)
        // core.endGroup() // Debug process.env

        // Debug
        core.startGroup('Debug')
        console.log('github.context.payload.repo:', github.context.repo)
        console.log('github.context.eventName:', github.context.eventName)
        console.log('github.context.ref:', github.context.ref)
        core.endGroup() // Debug

        // if (github.context.eventName !== 'release') {
        //     return core.warning(`Skipping event: ${github.context.eventName}`)
        // }
        if (github.context.payload.release?.prerelease) {
            return core.warning(`Skipping prerelease.`)
        }

        // Get Config
        const config = getConfig()
        core.startGroup('Parsed Config')
        console.log(config)
        core.endGroup() // Config

        if (!config.max || config.max > 100) {
            return core.setFailed('The max must be between 1 and 100.')
        }

        // Set Variables
        const octokit = github.getOctokit(config.token)

        const releases = await getReleases(config, octokit)
        // core.startGroup('Releases')
        // console.log('current:', current)
        // console.log('releases:', releases)
        // core.endGroup() // Releases

        // // TODO: MOCK API CODE
        // // console.log(JSON.stringify(releases))
        // const json = fs.readFileSync('test/test-releases.json', 'utf-8')
        // const releases = JSON.parse(json)
        // const json2 = fs.readFileSync('test/test-current.json', 'utf-8')
        // const current = JSON.parse(json2)
        // console.log('current:', current)
        // console.log('releases:', releases)

        console.log('releases.length:', releases.length)
        if (!releases.length) {
            return core.warning('No Releases to Process...')
        }

        core.startGroup('Processed Data')
        const processed = processReleases(releases)
        console.log('processed:', processed)
        core.endGroup() // Processed Data

        core.startGroup('Markdown Notes')
        const markdown = generateNotes(config, processed)
        console.log(markdown)
        core.endGroup() // Markdown Notes

        // Update Release
        if (config.update && github.context.payload.release?.id) {
            core.startGroup('Updated Release Body')
            const release = await octokit.rest.repos.getRelease({
                ...github.context.repo,
                release_id: github.context.payload.release.id,
            })
            // console.log('release:', release)
            console.log('before:\n', JSON.stringify(release.data.body))

            const body = `${release.data.body}\n\n${config.heading}\n\n${markdown}\n`
            // console.log(body)
            console.log('after:\n', JSON.stringify(body))

            core.endGroup() // Updated Release Body

            await octokit.rest.repos.updateRelease({
                ...github.context.repo,
                release_id: github.context.payload.release.id,
                body,
            })
        } else {
            core.info('⏩ \u001b[33;1mSkipping Release Notes Update')
        }

        // Outputs
        core.info('📩 Setting Outputs')
        core.setOutput('json', JSON.stringify(processed))
        core.setOutput('markdown', markdown)

        // Summary
        if (config.summary) {
            core.info('📝 Writing Job Summary')
            await addSummary(config, markdown)
        }

        core.info(`✅ \u001b[32;1mFinished Success`)
    } catch (e) {
        core.debug(e)
        core.info(e.message)
        core.setFailed(e.message)
    }
})()

function generateNotes(config, processed) {
    console.log('--- Generating Notes')
    // TODO: Process this data in processReleases ?
    const human = []
    for (const data of processed) {
        if (data.human.length) {
            human.push(...data.human)
        }
    }
    console.log('human:', human)
    const mdList = []
    for (const text of human) {
        const res = text.trim()
        if (res.startsWith('-')) {
            mdList.push(res)
        } else if (res.startsWith('*')) {
            mdList.push(`-${res.substring(1)}`)
        } else {
            mdList.push(`- ${res}`)
        }
    }
    console.log('mdList:', mdList)
    return mdList.join('\n')
}

function processReleases(releases) {
    const results = []

    // Split Human and Changes
    console.log('--- Splitting Releases')
    for (const release of releases) {
        let result = { name: release.tag_name, human: '', changed: '' }
        let body = release.body
        if (body.startsWith('**Full Changelog**')) {
            console.log('NOTHING')
            results.push(result)
            continue
        }
        if (body.includes("## What's Changed")) {
            // console.log(body)
            const split = body.split("## What's Changed")
            // console.log('split:', split)
            if (split.length > 1) {
                if (split[0]) {
                    console.log('HUMAN AND CHANGES')
                    result.human = split[0]
                } else {
                    console.log('CHANGES')
                }
                result.changed = split[1]
            }
        } else {
            console.log('HUMAN')
            result.human = body
        }
        results.push(result)
    }

    // Sanatize Human and Changes
    console.log('--- Processing Releases')
    for (const item of results) {
        console.log(item.name)
        // console.log(item)
        if (item.human.length) {
            const human = []
            const sep = item.human.includes('\r\n') ? '\r\n' : '\n'
            for (let x of item.human.split(sep)) {
                const trim = x.trim()
                if (trim && !trim.startsWith('**Full Changelog**')) {
                    human.push(trim)
                }
            }
            item.human = human
        }
        if (item.changed.length) {
            const changed = []
            const sep = item.changed.includes('\r\n') ? '\r\n' : '\n'
            for (let x of item.changed.split(sep)) {
                const trim = x.trim()
                if (trim?.startsWith('* ')) {
                    changed.push(trim)
                }
            }
            item.changed = changed
        }
    }
    return results
}

/**
 * Get Releases
 * @param config
 * @param {InstanceType<typeof github.GitHub>} octokit
 * @return {Promise<[InstanceType<typeof github.GitHub>]>}
 */
async function getReleases(config, octokit) {
    console.log('--- Getting Releases')
    const releases = await octokit.rest.repos.listReleases({
        ...github.context.repo,
        per_page: config.max,
    })
    let results = []
    for (const release of releases.data) {
        if (github.context.payload.release?.id === release.id) {
            console.debug('SKIPPING CURRENT RELEASE:', release.tag_name)
            continue
        }
        if (config.previous) {
            if (release.tag_name === config.previous) {
                console.log('STOPPING ON:', release.tag_name)
                break
            }
            if (!release.prerelease && config.pre) {
                console.log('SKIPPING:', release.tag_name)
                continue
            }
            console.log('ADDING:', release.tag_name)
            results.push(release)
        } else if (release.prerelease) {
            console.log('ADDING:', release.tag_name)
            results.push(release)
        } else {
            console.log('STOPPING ON:', release.tag_name)
            break
        }
    }
    // console.log('results:', results)
    // console.log('results.length:', results.length)
    return results
}

/**
 * Add Summary
 * @param {Object} config
 * @param {String} markdown
 * @return {Promise<void>}
 */
async function addSummary(config, markdown) {
    core.summary.addRaw('## Combine Release Notes Action\n\n')
    core.summary.addRaw('🚀 We Did It Red It!\n\n')

    core.summary.addRaw('<details><summary>Changelog</summary>')
    // core.summary.addRaw(markdown)
    core.summary.addCodeBlock(markdown, 'text')
    core.summary.addRaw('</details>\n')

    delete config.token
    const yaml = Object.entries(config)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join('\n')
    core.summary.addRaw('<details><summary>Config</summary>')
    core.summary.addCodeBlock(yaml, 'yaml')
    core.summary.addRaw('</details>\n')

    const text = 'View Documentation, Report Issues or Request Features'
    const link = 'https://github.com/smashedr/combine-release-notes-action'
    core.summary.addRaw(`\n[${text}](${link}?tab=readme-ov-file#readme)\n\n---`)
    await core.summary.write()
}

/**
 * Get Config
 * @return {{ previous: string, pre: boolean, max: number, update: boolean, heading: string, summary: boolean, token: string }}
 */
function getConfig() {
    return {
        previous: core.getInput('previous'),
        pre: core.getBooleanInput('pre'),
        max: parseInt(core.getInput('max')),
        update: core.getBooleanInput('update'),
        heading: core.getInput('heading'),
        summary: core.getBooleanInput('summary'),
        token: core.getInput('token', { required: true }),
    }
}

[![GitHub Tag Major](https://img.shields.io/github/v/tag/smashedr/combine-release-notes-action?sort=semver&filter=!v*.*&logo=git&logoColor=white&labelColor=585858&label=%20)](https://github.com/smashedr/combine-release-notes-action/tags)
[![GitHub Tag Minor](https://img.shields.io/github/v/tag/smashedr/combine-release-notes-action?sort=semver&filter=!v*.*.*&logo=git&logoColor=white&labelColor=585858&label=%20)](https://github.com/smashedr/combine-release-notes-action/tags)
[![GitHub Release Version](https://img.shields.io/github/v/release/smashedr/combine-release-notes-action?logo=git&logoColor=white&label=latest)](https://github.com/smashedr/combine-release-notes-action/releases/latest)
[![GitHub Dist Size](https://img.shields.io/github/size/smashedr/combine-release-notes-action/dist%2Findex.js?label=dist%20size)](https://github.com/smashedr/combine-release-notes-action/blob/master/src/index.js)
[![Workflow Release](https://img.shields.io/github/actions/workflow/status/smashedr/combine-release-notes-action/release.yaml?logo=github&label=release)](https://github.com/smashedr/combine-release-notes-action/actions/workflows/release.yaml)
[![Workflow Test](https://img.shields.io/github/actions/workflow/status/smashedr/combine-release-notes-action/test.yaml?logo=github&label=test)](https://github.com/smashedr/combine-release-notes-action/actions/workflows/test.yaml)
[![Workflow lint](https://img.shields.io/github/actions/workflow/status/smashedr/combine-release-notes-action/lint.yaml?logo=github&label=lint)](https://github.com/smashedr/combine-release-notes-action/actions/workflows/lint.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=smashedr_combine-release-notes-action&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=smashedr_combine-release-notes-action)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/smashedr/combine-release-notes-action?logo=github&label=updated)](https://github.com/smashedr/combine-release-notes-action/graphs/commit-activity)
[![Codeberg Last Commit](https://img.shields.io/gitea/last-commit/shaner/combine-release-notes-action/master?gitea_url=https%3A%2F%2Fcodeberg.org%2F&logo=codeberg&logoColor=white&label=updated)](https://codeberg.org/shaner/combine-release-notes-action)
[![GitHub Top Language](https://img.shields.io/github/languages/top/smashedr/combine-release-notes-action?logo=htmx)](https://github.com/smashedr/combine-release-notes-action)
[![GitHub Forks](https://img.shields.io/github/forks/smashedr/combine-release-notes-action?style=flat&logo=github)](https://github.com/smashedr/combine-release-notes-action/forks)
[![GitHub Repo Stars](https://img.shields.io/github/stars/smashedr/combine-release-notes-action?style=flat&logo=github)](https://github.com/smashedr/combine-release-notes-action/stargazers)
[![GitHub Org Stars](https://img.shields.io/github/stars/cssnr?style=flat&logo=github&label=org%20stars)](https://cssnr.github.io/)
[![Discord](https://img.shields.io/discord/899171661457293343?logo=discord&logoColor=white&label=discord&color=7289da)](https://discord.gg/wXy6m2X8wY)

# Combine Release Notes Action

- [Inputs](#Inputs)
  - [Permissions](#Permissions)
- [Outputs](#Outputs)
- [Examples](#Examples)
- [Tags](#Tags)
- [Support](#Support)
- [Contributing](#Contributing)

Action to Generate Combine Release Notes.

## Inputs

| Input&nbsp;Name | Type | Default&nbsp;Value       | Input&nbsp;Description      |
| :-------------- | :--: | :----------------------- | :-------------------------- |
| previous        |  -   | -                        | Previous Version to Stop \* |
| pre             |  -   | `true`                   | Skip Not Pre-Releases \*    |
| max             |  -   | `30`                     | Max Releases to Process     |
| update          |  -   | `true`                   | Update Release Notes \*     |
| heading         |  -   | `### Extended Changelog` | Release Notes Heading       |
| summary         |  -   | `true`                   | Add Summary to Job \*       |
| token           |  -   | `github.token`           | For Using a PAT [^1]        |

**previous:** Set this to the previous version to stop gathering notes.
Example, if you are on 1.0.0 and releasing 1.0.1 you can set previous to `1.0.0`
to get notes for all releases after 1.0.0.

**pre:** If you set `previous` and want to include releases not tagged as prerelease, set this to `false`.

**update:** Set this to `false` if you only want to use the [Outputs](#Outputs).

**summary:** Will add the results to the job summary in the workflow results.

<details><summary>👀 View Example Release Notes Update</summary>

---

### Extended Changelog

- I Fixxed It
- Ralf Brok It

---

</details>

No inputs required to process latest releases.

```yaml
- name: 'Combine Release Notes Action'
  uses: smashedr/combine-release-notes-action@master
```

### Permissions

This action requires the following permissions to update release notes:

```yaml
permissions:
  contents: write
```

## Outputs

| Output   | Output&nbsp;Description |
| :------- | :---------------------- |
| json     | Chnages JSON Object     |
| markdown | Changes Markdown String |

```yaml
- name: 'Combine Release Notes Action'
  id: changelog
  uses: smashedr/combine-release-notes-action@master

- name: 'Echo Output'
  run: |
    echo "changes: '${{ steps.changelog.outputs.json }}'"
    echo "table: '${{ steps.changelog.outputs.markdown }}'"
```

More Examples Coming Soon...

## Examples

💡 _Click on an example heading to expand or collapse the example._

<details open><summary>Custom Heading</summary>

```yaml
- name: 'Combine Release Notes Action'
  uses: smashedr/combine-release-notes-action@master
  with:
    heading: '**Extended Changelog**'
```

</details>
<details><summary>Detailed Custom Heading</summary>

```yaml
- name: 'Combine Release Notes Action'
  uses: smashedr/combine-release-notes-action@master
  with:
    heading: |
      ---

      # Extended Changelog
```

</details>
<details><summary>Use Outputs Only</summary>

```yaml
- name: 'Combine Release Notes Action'
  id: changelog
  uses: smashedr/combine-release-notes-action@master
  with:
    update: false

- name: 'Echo Output'
  run: |
    echo "changes: '${{ steps.changelog.outputs.json}}'"
    echo "table: '${{ steps.changelog.outputs.markdown}}'"
```

</details>
<details><summary>Full Workflow Example</summary>

```yaml
name: 'Release'

on:
  release:
    types: [published]

jobs:
  release:
    name: 'Release'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: write

    steps:
      - name: 'Combine Release Notes Action'
        uses: smashedr/combine-release-notes-action@master
        continue-on-error: true
```

</details>

<details><summary>Manual Generation Example</summary>

```yaml
name: 'Combine Notes'

on:
  workflow_dispatch:
    inputs:
      previous:
        description: 'Manually Specify Previous Tag'
        type: string
      pre:
        description: 'Skip Non Pre-Releases'
        type: boolean
        default: true
      max:
        description: 'Max Releases to Process'
        type: number
        default: 30

jobs:
  notes:
    name: 'Notes'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: read

    steps:
      - name: 'Combine Release Notes Action'
        id: notes
        uses: smashedr/combine-release-notes-action@master
        with:
          previous: ${{ inputs.previous }}
          pre: ${{ inputs.pre }}
          max: ${{ inputs.max }}
          update: false

      - name: 'Echo Markdown'
        continue-on-error: true
        env:
          MARKDOWN: ${{ steps.notes.outputs.markdown }}
        run: |
          echo "${MARKDOWN}"
```

This workflow is available here [notes.yaml](.github/workflows/notes.yaml).

</details>

More Examples Coming Soon...

## Tags

The following rolling [tags](https://github.com/smashedr/combine-release-notes-action/tags) are maintained.

| Version&nbsp;Tag                                                                                                                                                                                                                               | Rolling | Bugs | Feat. |   Name    |  Target  | Example  |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----: | :--: | :---: | :-------: | :------: | :------- |
| [![GitHub Tag Major](https://img.shields.io/github/v/tag/smashedr/combine-release-notes-action?sort=semver&filter=!v*.*&style=for-the-badge&label=%20&color=44cc10)](https://github.com/smashedr/combine-release-notes-action/releases/latest) |   ✅    |  ✅  |  ✅   | **Major** | `vN.x.x` | `vN`     |
| [![GitHub Tag Minor](https://img.shields.io/github/v/tag/smashedr/combine-release-notes-action?sort=semver&filter=!v*.*.*&style=for-the-badge&label=%20&color=blue)](https://github.com/smashedr/combine-release-notes-action/releases/latest) |   ✅    |  ✅  |  ❌   | **Minor** | `vN.N.x` | `vN.N`   |
| [![GitHub Release](https://img.shields.io/github/v/release/smashedr/combine-release-notes-action?style=for-the-badge&label=%20&color=red)](https://github.com/smashedr/combine-release-notes-action/releases/latest)                           |   ❌    |  ❌  |  ❌   | **Micro** | `vN.N.N` | `vN.N.N` |

You can view the release notes for each version on the [releases](https://github.com/cssnr/cloudflare-purge-cache-action/releases) page.

The **Major** tag is recommended. It is the most up-to-date and always backwards compatible.
Breaking changes would result in a **Major** version bump. At a minimum you should use a **Minor** tag.

# Support

For general help or to request a feature, see:

- Q&A Discussion: https://github.com/smashedr/combine-release-notes-action/discussions/categories/q-a
- Request a Feature: https://github.com/smashedr/combine-release-notes-action/discussions/categories/feature-requests

If you are experiencing an issue/bug or getting unexpected results, you can:

- Report an Issue: https://github.com/smashedr/combine-release-notes-action/issues
- Chat with us on Discord: https://discord.gg/wXy6m2X8wY
- Provide General Feedback: [https://cssnr.github.io/feedback/](https://cssnr.github.io/feedback/?app=Update%20Release%20Notes)

# Contributing

Currently, the best way to contribute to this project is to star this project on GitHub.

Additionally, you can support other GitHub Actions I have published:

- [Stack Deploy Action](https://github.com/cssnr/stack-deploy-action?tab=readme-ov-file#readme)
- [Portainer Stack Deploy](https://github.com/cssnr/portainer-stack-deploy-action?tab=readme-ov-file#readme)
- [VirusTotal Action](https://github.com/cssnr/virustotal-action?tab=readme-ov-file#readme)
- [Mirror Repository Action](https://github.com/cssnr/mirror-repository-action?tab=readme-ov-file#readme)
- [Update Version Tags Action](https://github.com/cssnr/update-version-tags-action?tab=readme-ov-file#readme)
- [Update JSON Value Action](https://github.com/cssnr/update-json-value-action?tab=readme-ov-file#readme)
- [Parse Issue Form Action](https://github.com/cssnr/parse-issue-form-action?tab=readme-ov-file#readme)
- [Cloudflare Purge Cache Action](https://github.com/cssnr/cloudflare-purge-cache-action?tab=readme-ov-file#readme)
- [Mozilla Addon Update Action](https://github.com/cssnr/mozilla-addon-update-action?tab=readme-ov-file#readme)
- [Docker Tags Action](https://github.com/cssnr/docker-tags-action?tab=readme-ov-file#readme)

For a full list of current projects to support visit: [https://cssnr.github.io/](https://cssnr.github.io/)

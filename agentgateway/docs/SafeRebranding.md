# Rebranding agentgateway

Generally it is legal to customize, modify, and redistribute agentgateway, because the project says it is licensed under Apache License 2.0. Apache 2.0 explicitly allows modification and redistribution, but it does not grant rights to use the licensor’s trademarks, trade names, or product names, so “rebranding” is a trademark issue as much as a license issue.

## What you can usually do
You can fork the code, change the UI, rename your fork, and ship your own distribution, as long as you keep the required copyright and license notices and comply with Apache 2.0’s conditions. The Apache License also says its terms do not give you permission to use the project’s trademarks or product names except as required by the license.

## What to avoid
Do not use “agentgateway,” “Linux Foundation,” or any confusingly similar branding in a way that suggests endorsement, sponsorship, or official affiliation without permission. Apache trademark policy also warns against domain names or branding that could confuse users about the source of the software or services.

## Practical takeaway
If you want to release a customized version, the safest path is to:
* Rename your fork to a clearly distinct product name.
* Remove or replace logos, marks, and “official” wording.
* Keep Apache 2.0 notices and attribution files intact.
* Avoid any branding that implies it is the official agentgateway project or Linux Foundation product.

# Checklist

## Safe approach
A safe rebrand is to fork the code, change the product name, replace logos, and keep the required Apache 2.0 notices and NOTICE file content intact. Apache’s trademark policy also says you generally may not use ASF trademarks in software product branding, and domain names that could confuse users are especially risky.

## What this means in practice
You can say “based on agentgateway” or “compatible with agentgateway” if the reference is truthful and not misleading, because nominative use is allowed when only what is necessary is used and there is no suggestion of endorsement. But naming your fork something like “agentgateway Pro” or using the original logo would likely create trademark risk.

Here’s a simple rebrand checklist for an agentgateway fork:

- Rename the product and all user-facing references so they do not use “agentgateway,” “Linux Foundation,” or anything confusingly similar.[1][2]
- Replace logos, icons, and visual marks with your own branding.[3][1]
- Remove or rewrite marketing copy that implies endorsement, sponsorship, or official affiliation.[2][1]
- Keep the Apache 2.0 license text, copyright notices, and any required NOTICE file content intact.[4][5]
- Preserve required attribution for upstream code, but do not present upstream trademarks as your own brand.[1][4]
- Use phrases like “compatible with agentgateway” or “forked from agentgateway” only when necessary and only in a truthful, non-misleading way.[4][1]
- Avoid using upstream project names in your domain name, package name, or organization name if that could confuse users about origin or endorsement.[2][1]
- Check every README, website header, docs page, CLI help text, Docker image tag, and Helm chart name for trademark issues.[3][1]
- If you want to use any Linux Foundation or project marks, get written permission or follow the applicable trademark policy first.[6][2]

Here’s a practical “replace these files/strings” checklist for rebranding an agentgateway-based codebase. You’re mainly looking for trademark-bearing names, logos, package identifiers, docs copy, and notice files that must be preserved rather than rewritten.[1][2]

## Replace these strings
Search for the upstream brand in all case variations, plus likely hyphenated and path-safe forms, because trademarks often appear in docs, binary names, image filenames, and package coordinates.[2][3]

- `agentgateway`, `agentgateway`, `agentgateway`
- `Linux Foundation`, `The Linux Foundation`, `LF`
- Upstream org/repo paths, for example GitHub org names, container image namespaces, Helm chart references, and docs URLs
- Taglines or phrases implying official status, such as `official`, `certified`, `maintained by`, `from the Linux Foundation`, or `endorsed by`[3][2]

## Check these files
These are the highest-risk places where upstream branding usually remains visible to users or distributors, so they should be reviewed first.[1][2]

- `README.md`, `docs/**`, `mkdocs.yml`, `docusaurus.config.*`, `website/**`
- `LICENSE`, `NOTICE`, `THIRD_PARTY_NOTICES*`, `COPYING`, `about.*`
- `package.json`, `pyproject.toml`, `setup.py`, `pom.xml`, `build.gradle*`, `Cargo.toml`, `go.mod`
- `Dockerfile*`, `docker-compose*`, `.github/**`, Helm charts, Kubernetes manifests, Terraform modules
- CLI and config surfaces such as `cmd/**`, `main.*`, `config.*`, `defaults.*`, `--help` output, banners, and startup logs
- Frontend branding surfaces such as `public/**`, `assets/**`, `static/**`, `src/components/Header*`, favicon files, logo SVG/PNG files, and HTML `<title>` tags

## Replace in user-facing surfaces
You should replace all branding the end user sees, because leaving upstream marks in the UI is where confusion and endorsement risk usually arises.[4][2]

- Product name in page titles, nav bars, login screens, admin panels, splash screens, and email templates
- CLI binary name, shell completions, manpages, and installation commands
- Container image names, package names, Homebrew formula names, and release artifact filenames
- Default domains, sample URLs, webhook callback examples, and API examples if they include upstream marks

## Do not rewrite blindly
Some files should be preserved or edited very carefully, because Apache 2.0 requires license and NOTICE preservation in distributed derivative works.[5][1]

- Keep `LICENSE` with the Apache 2.0 text intact.[1]
- Keep any required `NOTICE` content, though you may add your own notices alongside it if they do not alter the license terms.[6][1]
- Keep third-party copyright notices and dependency attributions intact.[7][5]
- Do not remove attribution just because you changed the branding; branding and attribution are different obligations.[3][1]

## Rename carefully
Renaming package and artifact identifiers is usually fine, but choose names that do not look like an official edition of the upstream project.[2][3]

- Good pattern: a distinct product name with optional text like “based on agentgateway” in documentation only, where needed and truthful.[4]
- Risky pattern: names like `agentgateway Pro`, `agentgateway Enterprise`, or domains containing the upstream mark, because they can imply source or endorsement.[2][4]

## Quick grep targets
If you want a fast first pass, search these path classes before deeper manual review, because they catch most residual branding in real repositories.[1][2]

- Markdown and docs: `*.md`, `*.mdx`, `docs/**`
- Config and manifests: `*.yaml`, `*.yml`, `*.json`, `*.toml`, `*.xml`
- Source and templates: `*.js`, `*.ts`, `*.tsx`, `*.go`, `*.py`, `*.java`, `*.rs`, `*.html`
- Assets and meta `*.svg`, `*.png`, `*.ico`, `*.txt`, release notes, changelogs, and CI publish configs

## Safe workflow
A simple sequence reduces the chance of either trademark leakage or license breakage.[2][1]

1. Inventory all upstream names, logos, domains, and package identifiers.
2. Replace user-facing branding first.
3. Review legal files separately; preserve `LICENSE` and applicable `NOTICE` text.[5][1]
4. Recheck build, packaging, docs, and release artifacts for leftover strings.
5. Review final copy for any implication of official Linux Foundation or upstream endorsement.[3][2]

## Shell Commands

See [How To Reband](./HowToRebrand.md) for details.

Sources

[1]: The Apache License, Version 2.0 https://httpd.apache.org/docs/trunk/license.html
[2] Trademark Usage - Linux Foundation https://www.linuxfoundation.org/legal/trademark-usage
[3] Open Source Doesn't Mean A Trademark Free-For-All - Forrester https://www.forrester.com/blogs/open-source-doesnt-mean-a-trademark-free-for-all/
[4] Apache Software Foundation Trademark Policy https://www.apache.org/foundation/marks/
[5] Applying the Apache license, version 2.0 https://www.apache.org/legal/apply-license.html
[6] How to apply the Apache 2.0 License to your Open Source software ... https://vladimirgorej.com/blog/how-to-apply-apache2-license-to-your-open-source-software-project/
[7] Apache License 2.0 - Memgraph https://memgraph.com/blog/apache-license-2-0
[8] Apache License 2.0 and steps for creating derivative works - Reddit https://www.reddit.com/r/COPYRIGHT/comments/1mzc09z/apache_license_20_and_steps_for_creating/
[9] Creative Commons and other Open Licenses for sharing your work https://libguides.wvu.edu/c.php?g=1260463&p=9239093
[10] Trademark and brand guidelines - Open Source Initiative https://opensource.org/about/brand-and-trademark-guidelines
[11] Trademarks | Linux Foundation https://www.linuxfoundation.org/legal/trademarks
[12] Changing the author on Apache 2.0 license : r/SoftwareEngineering https://www.reddit.com/r/SoftwareEngineering/comments/1aw8evp/changing_the_author_on_apache_20_license/
[13] Protecting Your Brand in Open Source: Trademarks, Forks, and ... https://www.termsfeed.com/blog/open-source-trademark/
[14] Review CNCF project names for trademark compliance #894 - GitHub https://github.com/cncf/foundation/issues/894
[15] Trademarks in Open Source - Google https://google.github.io/opencasebook/trademarks/
[16] Browse Projects - Linux Foundation https://www.linuxfoundation.org/projects

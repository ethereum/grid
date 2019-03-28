<p class="intro-text">
Grid has the mission to empower users with the latest and greatest of the ethereum ecosystem toolset.
<br>
<br>
It aims to greatly improve developer and user experience, enabling them to manage and run select tools at ease.
</p>

# Downloads

## Latest release {{ site.github.latest_release.tag_name }}

| OS  | File |
| --- | ---- |
{% for asset in site.github.latest_release.assets -%}
{%- if asset.name contains ".yml" or asset.name contains ".blockmap" %}{% else -%}
{%- if asset.name contains ".exe" -%} Windows installer
{%- elsif asset.name contains "-win.zip" -%} Windows
{%- elsif asset.name contains "-mac.zip" -%} Mac
{%- elsif asset.name contains ".dmg" -%} Mac
{%- elsif asset.name contains ".rpm" -%} Linux
{%- elsif asset.name contains ".deb" -%} Linux (Debian)
{%- elsif asset.name contains ".snap" -%} Linux (Universal)
{%- elsif asset.name contains ".AppImage" -%} Linux (Portable)
{%- else -%} -
{%- endif -%}
| [{{ asset.name }}]({{ asset.browser_download_url }})
{% endif -%}
{% endfor %}

For other releases, please head to [GitHub](https://github.com/ethereum/grid/releases).

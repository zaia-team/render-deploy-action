# Render Deploy Github Action

Instrument deploy to Render.com provider.\
Features available on this version:
- Manage hardcoded value env vars (key/value)
- Trigger render deploy

To prevent conflicts, it's highly recommended to disable render auto deploy.

## Inputs
### `definition_file`
**Required**\
Path to the render structured yaml definition file.\
Use Render blueprint YAML for reference: https://render.com/docs/blueprint-spec

### `token`
**Required**\
Render API token

### `trigger_deploy`
**Optional** - default `true`\
Should trigger the deploy to apply the changes after the definition file is processed

## Example usage

```yaml
uses: zaia-team/render-deploy-action@v0.2
with:
  definition_file: './render/production.json'
  token: 'your-render-token'
```
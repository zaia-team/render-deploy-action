# Render Deploy Github Action

Instrument deploy to Render.com provider.
Features available on this version:
- Change env vars
- Trigger render deploy

## Inputs
### `definition_file`
**Required** Path to the definition file

### `token`
**Required** Render API token

### `trigger_deploy`
**Optional** Should trigger the deploy to apply the changes after the definition file is processed - (yes/no) default is yes

## Example usage

```yaml
uses: zaia-team/render-deploy-action@v0.1.1
with:
  definition_file: './render/production.json'
  token: 'your-render-token'
import * as fs from 'fs'
import * as path from 'path';
import { DeploymentConfig, getDeploymentConfig } from './deployment-config';
import { NeptuneConfig, getConfig as getNeptuneConfig } from './sections/neptune';
import { NeptuneNotebookConfig, getConfig as getNeptuneNotebookConfig } from './sections/neptune-notebook';
import { NeptuneNotebookEfsConfig, getConfig as getNeptuneNotebookEfsConfig } from './sections/neptune-notebook-efs';
import { VpcConfig, getConfig as getVpcConfig } from './sections/vpc';
import { getSection} from './utils';
const yaml = require('js-yaml');

export interface Config {
    readonly Deployment: DeploymentConfig;
    readonly Neptune: NeptuneConfig;
    readonly NeptuneNotebook: NeptuneNotebookConfig;
    readonly NeptuneNotebookEfs: NeptuneNotebookEfsConfig;
    readonly Vpc: VpcConfig;
}
export function getConfig(environmentName: string, configPath: string): Config
{
    let env: string = environmentName ?? 'default';

    let deploymentYaml = yaml.load(fs.readFileSync(path.resolve(configPath+env+'.deployment.yaml'), 'utf8'));
    let configYaml = yaml.load(fs.readFileSync(path.resolve(configPath+env+'.yaml'), 'utf8'));

    let config: Config = {
        Deployment: getDeploymentConfig(deploymentYaml),
        Neptune: getNeptuneConfig(getSection(configYaml, 'Neptune')),
        NeptuneNotebook: getNeptuneNotebookConfig(getSection(configYaml, 'NeptuneNotebook')),
        NeptuneNotebookEfs: getNeptuneNotebookEfsConfig(getSection(configYaml, 'NeptuneNotebookEfs')),
        Vpc: getVpcConfig(getSection(configYaml, 'Vpc'))
    };

    return config;
}
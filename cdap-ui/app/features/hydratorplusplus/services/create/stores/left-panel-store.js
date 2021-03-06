/*
 * Copyright © 2015-2016 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/*
  This store is a collection of extensions and plugins for the side panel.
  {
    plugins: {
      'batchsource': {
        Stream:{
          type: ...,
          artifact: {...},
          allArtifacts: [ {...}, {...}],
          defaultArtifact
        }
      }
    },
    extensions: []
  }
*/

let leftpanelactions, _DAGPlusPlusFactory, _GLOBALS, _myHelpers;
let popoverTemplate = '/assets/features/hydratorplusplus/templates/create/popovers/leftpanel-plugin-popover.html';
let getInitialState = () => {
  return {
    plugins: {
      pluginTypes: {},
      pluginToVersionMap: {}
    },
    extensions: []
  };
};

const getPluginToArtifactMap = (plugins = []) => {
  let typeMap = {};
  plugins.forEach( plugin => {
    typeMap[plugin.name] = typeMap[plugin.name] || [];
    typeMap[plugin.name].push(plugin);
  });
  return typeMap;
};

const getTemplatesWithAddedInfo = (templates = [], extension = '') => {
  return templates.map( template => {
    return Object.assign({}, template, {
      nodeClass: 'plugin-templates',
      name: template.pluginTemplate,
      pluginName: template.pluginName,
      type: extension,
      icon: _DAGPlusPlusFactory.getIcon(template.pluginName),
      template: popoverTemplate
    });
  });
};

const getPluginsWithAddedInfo = (plugins = [], pluginToArtifactArrayMap = {}, extension = '') => {
  if ([plugins.length, extension.length].indexOf(0) !== -1) {
    return plugins;
  }
  const getExtaProperties = (plugin = {}, extension = '') => {
    return Object.assign({}, {
      type: extension,
      icon: _DAGPlusPlusFactory.getIcon(plugin.name || plugin.pluginName),
      template: popoverTemplate
    });
  };
  const getAllArtifacts = (_pluginToArtifactArrayMap = {}, plugin = {}, extension = '') => {
    if ([Object.keys(_pluginToArtifactArrayMap).length, Object.keys(plugin).length].indexOf(0) !== -1) {
      return [];
    }
    let _pluginArtifacts = _pluginToArtifactArrayMap[(plugin.name || plugin.pluginName)];
    if (!Array.isArray(_pluginArtifacts)) {
      return [];
    }
    return [..._pluginArtifacts]
           .map( plug => Object.assign({}, plug, getExtaProperties(plug, extension)));
  };
  const getArtifact = (_pluginToArtifactArrayMap = {}, plugin = {}) => {
    if(!Object.keys(plugin).length) { return {}; }
    return _myHelpers.objectQuery(_pluginToArtifactArrayMap, (plugin.name || plugin.pluginName), 0, 'artifact') || plugin.artifact;
  };
  return Object.keys(pluginToArtifactArrayMap).map( pluginName => {
    let plugin = pluginToArtifactArrayMap[pluginName][0];
    return Object.assign({}, plugin, getExtaProperties(plugin, extension), {
      artifact: getArtifact(pluginToArtifactArrayMap, plugin),
      allArtifacts: getAllArtifacts(pluginToArtifactArrayMap, plugin, extension)
    });
  });
};

const getDefaultVersionForPlugin = (plugin = {}, defaultVersionMap = {}) => {
  if([Object.keys(plugin), Object.keys(defaultVersionMap)].indexOf(0) !== -1) {
    return {};
  }
  let defaultVersionsList = Object.keys(defaultVersionMap);
  let key = `${plugin.name}-${plugin.type}-${plugin.artifact.name}`;
  let isDefaultVersionExists = defaultVersionsList.indexOf(key) !== -1;

  let isArtifactExistsInBackend = (plugin.allArtifacts || []).filter(plug => angular.equals(plug.artifact, defaultVersionMap[key]));
  if (!isDefaultVersionExists || !isArtifactExistsInBackend.length) {
    return plugin.artifact;
  }
  return angular.copy(defaultVersionMap[key]);
};

var plugins = (state = getInitialState().plugins, action = {}) => {
  let stateCopy;
  switch(action.type) {
    case leftpanelactions.PLUGINS_FETCH:
      stateCopy = Object.assign({}, state);
      const { extension, plugins } = action.payload;
      const pluginToArtifactArrayMap = getPluginToArtifactMap(plugins);
      const pluginsWithAddedInfo = getPluginsWithAddedInfo(plugins, pluginToArtifactArrayMap, extension);

      stateCopy.pluginTypes[extension] = pluginsWithAddedInfo
        .map( plugin => {
          plugin.defaultArtifact = getDefaultVersionForPlugin(plugin, state.pluginToVersionMap);
          return plugin;
        })
        .concat((state.pluginTypes[extension] || []));

      stateCopy.pluginTypes = Object.assign({}, state.pluginTypes, stateCopy.pluginTypes);
      return Object.assign({}, state, stateCopy);

    case leftpanelactions.PLUGIN_TEMPLATE_FETCH:
      stateCopy = Object.assign({}, state);
      const { pipelineType, namespace, res } = action.payload;
      const templatesList = _myHelpers.objectQuery(res, namespace, pipelineType);
      if (!templatesList) { return state; }

      angular.forEach( templatesList, (plugins, key) => {
        let _templates = _.values(plugins);
        let _pluginWithoutTemplates = (state.pluginTypes[key] || []).filter( plug => !plug.pluginTemplate);
        stateCopy.pluginTypes[key] = getTemplatesWithAddedInfo(_templates, key).concat(_pluginWithoutTemplates);
      });

      return Object.assign({}, state, stateCopy);

    case leftpanelactions.PLUGINS_DEFAULT_VERSION_FETCH:
      const defaultPluginVersionsMap = action.payload.res || {};
      stateCopy = Object.assign({}, getInitialState().plugins);
      if (Object.keys(defaultPluginVersionsMap).length) {
        const pluginTypes = Object.keys(state.pluginTypes);
        // If this is fetched after the all the plugins have been fetched from the backend then we will update them.
        pluginTypes.forEach( pluginType => {
          const _plugins = state.pluginTypes[pluginType];
          stateCopy.pluginTypes[pluginType] = _plugins
            .map( plugin => {
              plugin.defaultArtifact = getDefaultVersionForPlugin(plugin, defaultPluginVersionsMap);
              return plugin;
            });
        });
        stateCopy.pluginToVersionMap = defaultPluginVersionsMap;
        return Object.assign({}, state, stateCopy);
      }
      return state;

    case leftpanelactions.PLUGIN_DEFAULT_VERSION_CHECK_AND_UPDATE:
      let pluginTypes = Object.keys(state.pluginTypes);
      if (!pluginTypes.length) {
        return state;
      }
      let pluginToVersionMap = angular.copy(state.pluginToVersionMap);
      pluginTypes
        .forEach( pluginType => {
          state.pluginTypes[pluginType].forEach( plugin => {
            if (plugin.pluginTemplate) { return; }
            let key = `${plugin.name}-${plugin.type}-${plugin.artifact.name}`;
            let isArtifactExistsInBackend = plugin.allArtifacts.filter(
              plug => angular.equals(plug.artifact, pluginToVersionMap[key])
            );
            if (!isArtifactExistsInBackend.length) {
              delete pluginToVersionMap[key];
            }
          });
        });
        return Object.assign({}, state, {pluginToVersionMap});

    case leftpanelactions.RESET:
      return getInitialState().plugins;

    default:
      return state;
  }
};
var extensions = (state = getInitialState().extensions, action = {}) => {
  switch(action.type) {
    case leftpanelactions.EXTENSIONS_FETCH:
      const uiSupportedExtension = (extension) => {
        const pipelineType = action.payload.pipelineType;
        const extensionMap = _GLOBALS.pluginTypes[pipelineType];
        return Object.keys(extensionMap).filter(ext => extensionMap[ext] === extension).length;
      };
      return [
        ...state,
        ...action.payload.extensions.filter(uiSupportedExtension)
      ];
    case leftpanelactions.RESET:
        return getInitialState().extensions;
    default:
      return state;
  }
};

var LeftPanelStore = (LEFTPANELSTORE_ACTIONS, Redux, ReduxThunk, GLOBALS, DAGPlusPlusFactory, myHelpers) => {
  leftpanelactions = LEFTPANELSTORE_ACTIONS;
  _GLOBALS = GLOBALS;
  _myHelpers = myHelpers;
  _DAGPlusPlusFactory = DAGPlusPlusFactory;
  let {combineReducers, applyMiddleware} = Redux;

  let combineReducer = combineReducers({
    plugins,
    extensions
  });

  return Redux.createStore(
    combineReducer,
    getInitialState(),
    Redux.compose(
      applyMiddleware(ReduxThunk.default),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );
};
LeftPanelStore.$inject = ['LEFTPANELSTORE_ACTIONS', 'Redux', 'ReduxThunk', 'GLOBALS', 'DAGPlusPlusFactory', 'myHelpers'];

angular.module(`${PKG.name}.feature.hydratorplusplus`)
  .constant('LEFTPANELSTORE_ACTIONS', {
    'PLUGINS_FETCH': 'PLUGINS_FETCH',
    'PLUGIN_TEMPLATE_FETCH': 'PLUGIN_TEMPLATE_FETCH',
    'PLUGINS_DEFAULT_VERSION_FETCH': 'PLUGINS_DEFAULT_VERSION_FETCH',

    'EXTENSIONS_FETCH': 'EXTENSIONS_FETCH',

    'RESET': 'LEFTPANELSTORE_RESET',
    'PLUGINS_DEFAULT_VERSION_UPDATE': 'PLUGINS_DEFAULT_VERSION_UPDATE',
    'PLUGIN_DEFAULT_VERSION_CHECK_AND_UPDATE': 'PLUGIN_DEFAULT_VERSION_CHECK_AND_UPDATE'
  })
  .factory('HydratorPlusPlusLeftPanelStore', LeftPanelStore);

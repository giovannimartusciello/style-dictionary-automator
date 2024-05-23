import StyleDictionary from 'style-dictionary';

export class Filter {
  constructor(name, path, type) {
    this.name = name;
    this.type = type;
    this.path = path
  }
}

export class Transformer {
  constructor(name, type, matcher, transformer) {
    this.name = name;
    this.type = type;
    this.matcher = matcher;
    this.transformer = transformer
  }
}

export class Builder {

  transformersGroup = ["name/cti/camel"]

  run(config) {
    this.transformersGroup = ["name/cti/camel"]
    this.transformersGroupName = config.transformersGroupName;
    this.filters = config.filters;
    this.transformers = config.transformers;
    this.registerFilters()
    this.registerTransforms()
    this.registerTransformGroup()
  }

  registerFilters() {
    this.filters.forEach(function(element) {
      StyleDictionary.registerFilter({
        name: element.name,
        matcher: function (token) {
          if (element.path == null) {
            // If filter path is null, just return all the 
            // matching types
            return token.type === element.type;
          }
          else if (Array.isArray(element.path)) {
            // If filter path is an array, just match if the token path
            // is contained within the given array
            const isSameTokenType = token.type === element.type 
            const isPathInArray = element.path.some((path) => path === token.path[0]) 
            return isSameTokenType && isPathInArray
          }
          else {
            // If the filter path is a string, just return 
            // the elements mathing that single path and type
            return token.path[0] === element.path && token.type === element.type;
          }
        }
      });
    });
  }

  registerTransforms() {
    this.transformers.forEach(function(element) {
      StyleDictionary.registerTransform({
        name: element.name,
        type: element.type,
        transitive: true,
        matcher: function(token) {
            return element.matcher(token);
        },
        transformer: function(token) {
          return element.transformer(token);
        }
      });
      this.transformersGroup.push(element.name);
    }, this);
  }

  registerTransformGroup() {
    StyleDictionary.registerTransformGroup({
      name: this.transformersGroupName,
      // as you can see, here we are completely ignoring the "attribute/cti" transform (it's totally possible),
      // because we are relying on custom attributes for the matchers and the custom format for the output
      transforms: this.transformersGroup
    });
  }

  build() {
    const StyleDictionaryExtended = StyleDictionary.extend('./config.json');
    StyleDictionaryExtended.buildAllPlatforms();
  }
}

export class Common {

  static isRawColor(token) {
    return token.type === 'color' && (token.value.startsWith('#') || token.value.startsWith('rgb'));
  }

  static isBorderWidth(token) {
    return token.path[0] === 'borders';
  }

  static isBorderRadius(token) {
    return token.path[0] === 'radius';
  }

  static transform(name, value) {
    return StyleDictionary.transform[name].transformer({ value: value });
  }
}

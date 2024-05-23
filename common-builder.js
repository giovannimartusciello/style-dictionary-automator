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

  static isBowShadow(token) {
    return token.type === 'boxShadow';
  }

  static isBorderWidth(token) {
    return token.type === 'borderWidth';
  }

  static isBorderRadius(token) {
    return token.type === 'borderRadius';
  }

  static isOpacity(token) {
    return token.type === 'opacity';
  }

  static isLineHeight(token) {
    return token.type === 'lineHeights';
  }

  static isFontSize(token) {
    return token.type === 'fontSizes';
  }

  static isLetterSpacing(token) {
    return token.type === 'letterSpacing';
  }

  static isParagraphSpacing(token) {
    return token.type == "paragraphSpacing"
  }

  static isFontWeight(token) {
    return token.type === 'fontWeights';
  }

  static isTextCase(token) {
    return token.type === 'textCase';
  }

  static isTextDecoration(token) {
    return token.type == "textDecoration"
  }

  static isFontFamilies(token) {
    return token.type == "fontFamilies"
  }

  static isTypography(token) {
    return token.type == "typography"
  }
  
  static isSpacing(token) {
    return token.type == "spacing"
  }

  static transform(name, value) {
    return StyleDictionary.transform[name].transformer({ value: value });
  }

  static cleanName(type,name) {
    name = name.charAt(0).toLowerCase() + name.slice(1)
    if (name.includes(type)) {
      let newName = name.replace(type,'');
      return isNaN(newName) ? newName : "_"+newName;
    } else if (name.includes(type.slice(0, -1))) {
      let newName = name.replace(type.slice(0, -1),'');
      return isNaN(newName) ? newName : "_"+newName;
    }
    return name;
  }
}

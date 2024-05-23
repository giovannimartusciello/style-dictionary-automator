import {Filter, Transformer, Common} from './common-builder.js';


export class iOSBuilderConfig {
  transformersGroupName = 'custom/ios-swift-separate';

  filters = [
    new Filter("isPaletteColor", 'color', 'color'),
    new Filter("isDarkColor", 'dark', 'color'),
    new Filter("isLightColor", 'light', 'color'),
    new Filter("isDarkShadowColor", 'dark', 'boxShadow'),
    new Filter("isLightShadowColor", 'light', 'boxShadow'),
    new Filter("isBorderWidth", 'border', 'borderWidth'),
    new Filter("isBorderRadius", 'radius', 'borderRadius'),
    new Filter("isOpacity", 'opacity', 'opacity'),
    new Filter("isLineHeight", 'lineHeight', 'lineHeights'),
    new Filter("isLetterSpacing", 'letterSpacing', 'letterSpacing'),
    new Filter("isParagraphSpacing", 'paragraphSpacing', 'paragraphSpacing'),
    new Filter("isFontWeight", 'fontWeight', 'fontWeights'),
    new Filter("isTextCase", 'textCase', 'textCase'),
    new Filter("isTextDecoration", 'textDecoration', 'textDecoration'),
    new Filter("isFontFamilies", 'standfor', 'fontFamilies'),
    new Filter("isFontFamilies", 'poppins', 'fontFamilies'),
    new Filter("isTypography", 'body', 'typography'),
    new Filter("isTypography", 'label', 'typography'),
    new Filter("isSpacing", 'spacing', 'spacing')
  ]

  transformers = [
    new Transformer('color/customSwiftUIColor','value',Common.isRawColor,this.makeColorSwiftUI),
    new Transformer('color/customSwiftUIColorName','value',this.isColor,this.makeColorName),
    new Transformer('color/customSwiftUIShadow','value',Common.isBowShadow,this.makeSwiftUIShadow),
    new Transformer('border/customSwiftUIBorderWidth','value',Common.isBorderWidth,this.makeSwiftUIBorderWidth),
    new Transformer('border/customSwiftUIBorderRadius','value',Common.isBorderRadius,this.makeSwiftUIPxToCGFloat),
    new Transformer('opacity/customSwiftUIOpacity','value',Common.isOpacity,this.makeSwiftUIOpacity),
    new Transformer('lineHeight/customSwiftUILineHeight','value',Common.isLineHeight,this.makeSwiftUIPxToFloat),
    new Transformer('fontSize/customSwiftUIFontSize','value',Common.isFontSize,this.makeSwiftUIPxToFloat),
    new Transformer('letterSpacing/customSwiftUILetterSpacing','value',Common.isLetterSpacing,this.makeSwiftUIPxToFloat),
    new Transformer('paragraphSpacing/customSwiftUIParagraphSpacing','value',Common.isParagraphSpacing,this.makeSwiftUIPxToFloat),
    new Transformer('fontWeight/customSwiftUIFontWeight','value',Common.isFontWeight,this.makeSwiftUIToString),
    new Transformer('textCase/customSwiftUITextCase','value',Common.isTextCase,this.makeSwiftUIToString),
    new Transformer('textDecoration/customSwiftUITextDecoration','value',Common.isTextDecoration,this.makeSwiftUIToString),
    new Transformer('fontFamilies/customSwiftUIFontFamilies','value',Common.isFontFamilies,this.makeSwiftUIToString),
    new Transformer('typography/customSwiftUITypography','value',Common.isTypography,this.makeSwiftUITypography),
    new Transformer('isSpacing/customSwiftUISpacing','value',Common.isSpacing,this.makeSwiftUIPxToFloat)
  ]

  isColor(token) {
    return token.type === 'color' && (!token.value.startsWith('#') && !token.value.startsWith('rgb'));
  }

  makeColorName(token) {
    token.name = token.name.replace(token.path[0],'');
    token.name = token.name.charAt(0).toLowerCase() + token.name.slice(1);
    return token.value;
  }

  makeColorSwiftUI(token) {
    return Common.transform("color/ColorSwiftUI", token.value)
  }

  makeSwiftUIOpacity(token) {
    token.name =  Common.cleanName(token.type, token.name);
    var value = token.value
    if (value.length > 1) {
      value = value.slice(0, -1)
    }
    return parseFloat(value)/100;
  }

  makeSwiftUIToString(token) {
    token.name =  Common.cleanName(token.type, token.name);
    return "\""+token.value+"\"";
  }

  makeSwiftUIPxToFloat(token) {
    token.name =  Common.cleanName(token.type, token.name);
    return parseFloat(token.value).toFixed(1);
  }

  makeSwiftUIPxToCGFloat(token) {
    token.name = Common.cleanName(token.type, token.name);
    var sizePxToRem = Common.transform("size/pxToRem", token.value);
    return Common.transform("size/swift/remToCGFloat", sizePxToRem);
  }

  makeSwiftUIBorderWidth(token) {
    token.name = "width" + token.path[1];
    var sizePxToRem = Common.transform("size/pxToRem", token.value);
    return Common.transform("size/swift/remToCGFloat", sizePxToRem);
  }

  makeSwiftUIShadow(token) {
    token.name = token.name.replace('Shadow','');
    var str = `[`
    token.value.forEach(function(element, index, array) {
      const {color, type, x, y, blur, spread} = element;
      var colorSwiftUI = (color.startsWith('#') || color.startsWith('rgb')) ? Common.transform("color/ColorSwiftUI", color) : color
      var shadowType = type === "dropShadow" ? "Shadow.Placement.outer" : "Shadow.Placement.inner";
      str = str.concat(`Shadow(color: ${colorSwiftUI}, type: ${shadowType}, x: ${x}, y: ${y}, blur: ${blur}, spread: ${spread})`);
      if (index != array.length - 1) {
        str = str.concat(`, `)
      }
    });
    return str.concat(`]`)
  }

  makeSwiftUITypography(token) {
      const {fontFamily, fontWeight, lineHeight, fontSize, letterSpacing, paragraphSpacing, textCase, textDecoration} = token.value;
      var fontName = `"${fontFamily.slice(1, -1)}-${fontWeight.slice(1, -1)}"`
      var size = `${fontSize}`
      var kerning = `${letterSpacing}`
      var lineSpacing = `((${lineHeight} - ${fontSize})/2)`
      var str = `TypographyStyle(name: ${fontName}, size: ${size}, kerning: ${kerning}, lineSpacing: ${lineSpacing})`;
      return str
  }
}

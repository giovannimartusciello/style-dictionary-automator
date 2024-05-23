import {Filter, Transformer, Common} from './common-builder.js';


export class AndroidBuilderConfig {
  transformersGroupName = 'custom/compose';

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
    new Filter("isFontSize", 'fontSize', 'fontSizes'),
    new Filter("isLetterSpacing", 'letterSpacing', 'letterSpacing'),
    new Filter("isParagraphSpacing", 'paragraphSpacing', 'paragraphSpacing'),
    new Filter("isFontWeight", 'fontWeight', 'fontWeights'),
    new Filter("isTextCase", 'textCase', 'textCase'),
    new Filter("isTextDecoration", 'textDecoration', 'textDecoration'),
    new Filter("isFontFamilies", null, 'fontFamilies'),
    new Filter("isTypography", [
      "display",
      "headline",
      "title",
      "label",
      "body",
      "amount",
      "extra",
    ], 'typography'),
    new Filter("isSpacing", 'spacing', 'spacing')
  ]

  transformers = [
    new Transformer('color/customComposeColor','value',Common.isRawColor,this.makeComposeColor),
    new Transformer('color/customComposeShadow','value',Common.isBowShadow,this.makeComposeShadow),
    new Transformer('border/customComposeBorderWidth','value',Common.isBorderWidth,this.makeComposeBorderWidth),
    new Transformer('border/customComposeBorderRadius','value',Common.isBorderRadius,this.makeComposeToDp),
    new Transformer('opacity/customComposeOpacity','value',Common.isOpacity,this.makeComposeOpacity),
    new Transformer('lineHeight/customComposeLineHeight','value',Common.isLineHeight,this.makeComposeSp),
    new Transformer('fontSize/customComposeFontSize','value',Common.isFontSize,this.makeComposeSp),
    new Transformer('letterSpacing/customComposeLetterSpacing','value',Common.isLetterSpacing,this.makeComposeSp),
    new Transformer('paragraphSpacing/customComposeParagraphSpacing','value',Common.isParagraphSpacing,this.makeComposeSp),
    new Transformer('fontWeight/customComposeFontWeight','value',Common.isFontWeight,this.makeComposeFontWeight),
    new Transformer('textCase/customComposeTextCase','value',Common.isTextCase,this.makeComposeTextCase),
    new Transformer('textDecoration/customComposeTextDecoration','value',Common.isTextDecoration,this.makeComposeTextDecoration),
    new Transformer('fontFamilies/customComposeFontFamilies','value',Common.isFontFamilies,this.makeComposeFontFamily),
    new Transformer('typography/customTypography', 'value', Common.isTypography, this.makeComposeTextStyle),
    new Transformer('isSpacing/customSpacing','value',Common.isSpacing,this.makeComposeToDp)
  ]

  makeComposeColor(token) {
    return Common.transform("color/composeColor", token.value)
  }

  makeComposeToString(token) {
    return "\""+token.value+"\"";
  }

  makeComposeTextDecoration(token) {
    // TODO: Once the namespace issue is fixed (https://github.com/amzn/style-dictionary/pull/874)
    // this can be simplified to use imports instead of hardcoding the namespaces here
    
    const { value } = token

    if (value === "none") {
      return "androidx.compose.ui.text.style.TextDecoration.None"
    }
    if (value === "underline") {
      return "androidx.compose.ui.text.style.TextDecoration.Underline"
    }
    if (value === "line-through") {
      return "androidx.compose.ui.text.style.TextDecoration.LineThrough"
    }

    throw Error(`Text Decoration value not supported: ${value}`)
  }

  makeComposeFontWeight(token) {
    // TODO: Once the namespace issue is fixed (https://github.com/amzn/style-dictionary/pull/874)
    // this can be simplified to use imports instead of hardcoding the namespaces here
    
    const { value } = token

    if (value === "Bold") {
      return "androidx.compose.ui.text.font.FontWeight.Bold"
    }
    if (value === "Medium") {
      return "androidx.compose.ui.text.font.FontWeight.Medium"
    }
    if (value === "Regular") {
      return "androidx.compose.ui.text.font.FontWeight.Normal"
    }
    if (value === "SemiBold") {
      return "androidx.compose.ui.text.font.FontWeight.SemiBold"
    }

    throw Error(`Font Weight value not supported: ${value}`)
  }

  makeComposeTextCase(token) {
    return `"${token.value}"`;
  }

  makeComposePxToFloat(token) {
    return parseFloat(token.value).toFixed(1);
  }

  makeComposeSp(token) {
    const { value } = token
    let spValue = ""

    if (value % 1 !== 0) { 
    // If contains decimals, add parenthesis to improve readability
      spValue = `(${value}).sp`
    }
    else {
      //If there are no decimals, just add the number without decimals
      spValue = `${Math.trunc(value)}.sp`
    }
    
    return spValue
  }

  makeComposeOpacity(token) {
    var value = token.value
    if (value.length > 1) {
      value = value.slice(0, -1)
    }
    return parseFloat(value)/100;
  }

  makeComposeToDp(token) {
    var sizePxToRem = Common.transform("size/pxToRem", token.value);
    return Common.transform("size/compose/remToDp", sizePxToRem);
  }

  makeComposeBorderWidth(token) {
    token.name = "borderWidth" + token.path[1];
    var sizePxToRem = Common.transform("size/pxToRem", token.value);
    return Common.transform("size/compose/remToDp", sizePxToRem);
  }

  makeComposeShadow(token) {
    var str = `listOf(
      `
    token.value.forEach(function(element, index, array) {
      const {color, type, x, y, blur, spread} = element;
      var colorCompose = (color.startsWith('#') || color.startsWith('rgb')) ? Common.transform("color/composeColor", color) : color
      var shadowType = type === "dropShadow" ? "ShadowType.OUTER" : "ShadowType.INNER";
      str = str.concat(`Shadow(
        color =  ${colorCompose},
        type =  ${shadowType},
        x =  ${x},
        y =  ${y},
        blur =  ${blur},
        spread =  ${spread}
      )`);

      if (index != array.length - 1) {
        str = str.concat(`, `)
      }
    });
    return str.concat(`
    )`)
  }

  makeComposeFontFamily(token) {
    // TODO: Once the namespace issue is fixed (https://github.com/amzn/style-dictionary/pull/874)
    // this can be simplified to use imports instead of hardcoding the namespaces here
    const fontName = token.value.toLowerCase();
    return `FontFamily(
      Font(com.webank.common_ui_compose.R.font.${fontName}_400, com.webank.common_ui_compose.theme.dictionary.FontWeight.fontWeightRegular),
      Font(com.webank.common_ui_compose.R.font.${fontName}_500, com.webank.common_ui_compose.theme.dictionary.FontWeight.fontWeightMedium),
      Font(com.webank.common_ui_compose.R.font.${fontName}_600, com.webank.common_ui_compose.theme.dictionary.FontWeight.fontWeightSemibold),
      Font(com.webank.common_ui_compose.R.font.${fontName}_700, com.webank.common_ui_compose.theme.dictionary.FontWeight.fontWeightBold)
    )`
  }
  
  makeComposeTextStyle(token) {
      const {
        fontFamily,
        fontWeight,
        lineHeight,
        fontSize,
        letterSpacing,
        textDecoration
      } = token.value;


      return `TextStyle(
        fontFamily = FontFamilies.${fontFamily}, 
        fontWeight = FontWeight.${fontWeight},
        fontSize = FontSize.${fontSize},
        lineHeight = LineHeight.${lineHeight},
        letterSpacing = LetterSpacing.${letterSpacing},
        textDecoration = TextDecoration.${textDecoration}
      )`
  }
}

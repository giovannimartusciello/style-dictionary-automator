import {Filter, Transformer, Common} from './common-builder.js';
import { readFile, writeFile, appendFile, unlinkSync } from 'fs'

export class iOSCustomsBuilderConfig {
  transformersGroupName = 'custom/ios-swift-customs';

  filters = [
    new Filter("isProtocolColor", 'light', 'color'),
  ]

  transformers = [
    new Transformer('color/customSwiftUIProtocolColorName','value',this.isColor,this.makeGeneratedColorName),
  ]

  isColor(token) {
    return token.type === 'color';
  }

  makeGeneratedColorName(token) {
    token.name = token.name.replace(token.path[0],'');
    token.name = token.name.charAt(0).toLowerCase() + token.name.slice(1);

    if (token.type == 'color' && token.path[0] == 'light') {
      appendFile("build/ios-swift/GeneratedColor+Mirror.temp.swift", '"'+token.name+'": '+token.name+',\n\t\t\t', 'utf8', function (err) {
        if (err) return console.log(err);
      });
    }

    return "";
  }

  build() {
    this.makeBFBColorEnum();
    this.makeGeneratedColor();
    this.makeMirrorGeneratedColor();
  }

  makeMirrorGeneratedColor() {
    readFile("build/ios-swift/GeneratedColor+Mirror.temp.swift", 'utf8', function (err,properties) {
      readFile("custom-template/Mirror.swift", 'utf8', function (err,data) {
        var formatted = data.replaceAll('%NAME%', 'GeneratedColor');
        var formatted = formatted.replaceAll('%TYPE%', 'Color');
        
        var formatted = formatted.replaceAll('"%PROPERTY%": %PROPERTY%', properties.replace(/,\n\t\t\t(?![\s\S]*,\n\t\t\t)/, ''));

        writeFile("build/ios-swift/GeneratedColor+Mirror.swift", formatted, 'utf8', function (err) {
          if (err) return console.log(err);
          unlinkSync("build/ios-swift/GeneratedColor+Mirror.temp.swift");
        });
      }, properties);
    });
  }

  makeGeneratedColor() {
    readFile("build/ios-swift/GeneratedColor.swift", 'utf8', function (err,data) {
      var formatted = data.replaceAll(' = ', ': Color { get }');
      var formatted = formatted.replaceAll(' let ', ' var ');
      writeFile("build/ios-swift/GeneratedColor.swift", formatted, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    });
  }

  makeBFBColorEnum() {
    readFile("build/ios-swift/GeneratedColor.swift", 'utf8', function (err,data) {
      var formatted = data.replaceAll('protocol GeneratedColor', 'enum BFBColor: String');
      var formatted = formatted.replaceAll('SwiftUI', 'Foundation');
      var formatted = formatted.replaceAll(' = ', '');
      var formatted = formatted.replaceAll('static let ', 'case ');
      writeFile("build/ios-swift/BFBColor.swift", formatted, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    }); 
  }
}

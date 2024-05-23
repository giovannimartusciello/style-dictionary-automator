import {AndroidBuilderConfig} from './build-android.js';
import {iOSBuilderConfig} from './build-ios.js';
import {Builder} from './common-builder.js';

var builder = new Builder();
var ios = new iOSBuilderConfig();
var android = new AndroidBuilderConfig();

console.log('Build started...');
console.log('\n==============================================');

builder.run(ios);
builder.run(android);

builder.build();

console.log('\n==============================================');
console.log('\nBuild completed!');

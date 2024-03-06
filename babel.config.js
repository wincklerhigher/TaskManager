module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    "@babel/plugin-transform-async-generator-functions",
    "@babel/plugin-transform-numeric-separator",
    "@babel/plugin-transform-optional-chaining",
    "@babel/plugin-transform-optional-catch-binding",
    "@babel/plugin-transform-nullish-coalescing-operator",
    ["@babel/plugin-transform-object-rest-spread", { "loose": true }],
    ["@babel/plugin-transform-class-properties", { "loose": true }],
    ["@babel/plugin-transform-private-methods", { "loose": true }],
    ["@babel/plugin-transform-private-property-in-object", { "loose": true }]
  ]
};
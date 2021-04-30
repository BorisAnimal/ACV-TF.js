# TensorFlow.js Examples

This repository contains a set of examples implemented in
[TensorFlow.js](http://js.tensorflow.org).

Each example directory is standalone so the directory can be copied
to another project.

# Modules

### `mnist-core`
Contains training of the network. 
Currently, works with MNIST dataset. 
Provides visualization of training process (loss plot, test predictions).

### `mnist-gui`
Contains interactive client for drawing.

# Dependencies

Except for `getting_started`, all the examples require the following dependencies to be installed.

 - Node.js version 8.9 or higher
 - [NPM cli](https://docs.npmjs.com/cli/npm) OR [Yarn](https://yarnpkg.com/en/)

## How to build an example
`cd` into the directory

If you are using `yarn`:

```sh
cd mnist-core
yarn
yarn watch
```

If you are using `npm`:
```sh
cd mnist-core
npm install
npm run watch
```

### Details

The convention is that each example contains two scripts:

- `yarn watch` or `npm run watch`: starts a local development HTTP server which watches the
filesystem for changes so you can edit the code (JS or HTML) and see changes when you refresh the page immediately.

- `yarn build` or `npm run build`: generates a `dist/` folder which contains the build artifacts and
can be used for deployment.

## Contributing

If you want to contribute an example, please reach out to us on
[Github issues](https://github.com/tensorflow/tfjs/issues)
before sending us a pull request as we are trying to keep this set of examples
small and highly curated.

### Running Presubmit Tests

Before you send a pull request, it is a good idea to run the presubmit tests
and make sure they all pass. To do that, execute the following commands in the
root directory of tfjs-examples:

```sh
yarn
yarn presubmit
```

The `yarn presubmit` command executes the unit tests and lint checks of all
the exapmles that contain the `yarn test` and/or `yarn lint` scripts. You
may also run the tests for individual exampls by cd'ing into their respective
subdirectory and executing `yarn`, followed by `yarn test` and/or `yarn lint`.

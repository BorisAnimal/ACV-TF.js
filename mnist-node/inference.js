/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

const tf = require('@tensorflow/tfjs-node');

const data = require('./data');
const modelDir = './models/';

const model = tf.loadLayersModel(`file://${modelDir}/model.json`);
model.then(inferenceDemo);

function inferenceDemo(model) {
    // console.log(model);


    const pred = model.predict(tf.zeros([2, 28, 28, 1])).argMax(1);
    console.log("Predict:" + pred.dataSync());
}

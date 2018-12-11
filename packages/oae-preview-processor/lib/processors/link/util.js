/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

const ent = require('ent');

const log = require('oae-logger').logger('oae-preview-processor');

const PreviewUtil = require('oae-preview-processor/lib/util');

/**
 * Resizes an image generated by one of the link processors in the appropriate sizes and updates
 * the content item with metadata if it has been provided.
 *
 * @param  {Context}    ctx                 Standard context object containing the current user and the current tenant
 * @param  {String}     path                The path where the image has been stored
 * @param  {Object}     [opts]              Optional metadata that should be stored on the content item. Useful to update content information such as display name based on remote information
 * @param  {String}     [opts.displayName]  The new display name for this piece of content
 * @param  {String}     [opts.description]  The new description for this piece of content
 * @param  {Function}   callback            Standard callback function
 * @param  {Object}     callback.err        An error that occurred, if any
 */
const generatePreviewsFromImage = function(ctx, path, opts, callback) {
  // Crop the screenshot.
  PreviewUtil.generatePreviewsFromImage(ctx, path, {}, err => {
    if (err) {
      return callback(err);
    }

    // Check if we can update the main content metadata (displayName, description, ..)
    opts = opts || {};
    if (
      opts.displayName &&
      ctx.content.displayName === ctx.content.link &&
      typeof opts.displayName === 'string'
    ) {
      ctx.addContentMetadata('displayName', ent.decode(opts.displayName));
      log().trace({ contentId: ctx.contentId }, 'Updating the content displayName.');
    }

    if (opts.description && !ctx.content.description && typeof opts.description === 'string') {
      ctx.addContentMetadata('description', ent.decode(opts.description));
      log().trace({ contentId: ctx.contentId }, 'Updating the content description.');
    }

    return callback();
  });
};

module.exports = { generatePreviewsFromImage };
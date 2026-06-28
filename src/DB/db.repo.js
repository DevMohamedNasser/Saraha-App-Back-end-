export const findOne = async ({
  model,
  filter = {},
  select = "",
  options = {},
}) => {
  const doc = model.findOne(filter);

  if (select.length) doc.select(select);
  if (options.populate) doc.populate(options.populate);
  if (options.lean) doc.lean(options.lean);

  return await doc.exec();
};

export const create = async ({
  model,
  data,
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.create(data, options);
};

export const findById = async ({ model, id, select = "", options = {} }) => {
  const doc = model.findById(id);

  if (select.length) doc.select(select);
  if (options.populate) doc.populate(options.populate);
  if (options.lean) doc.lean(options.lean);

  return await doc.exec();
};

export const find = async ({
  model,
  filter = {},
  options = {},
  select = "",
}) => {
  const docs = model.find(filter);

  if (select.length) docs.select(select);
  if (options.populate) docs.populate(options.populate);
  if (options.lean) docs.lean(options.lean);
  if (options?.limit) docs.limit(options.limit);
  if (options?.skip) docs.skip(options.skip);

  return await docs.exec();
};

export const insertMany = async ({ model, data } = {}) => {
  return await model.insertMany(data);
};

export const updateOne = async ({ model, filter, data, options = {} }) => {
  return await model.updateOne(filter, { ...data, $inc: { __v: 1 } }, options);
};

export const findOneAndUpdate = async ({
  model,
  filter,
  data,
  options: {},
}) => {
  return await model.findOneAndUpdate(
    filter,
    { ...data, $inc: { __v: 1 } },
    { ...options, returnDocument: "after", runValidators: true }, //returnDocument: 'after
  );
};

export const findByIdAndUpdate = async ({ model, id, data, options = {} }) => {
  return await model.findByIdAndUpdate(
    id,
    { ...data, $inc: { __v: 1 } },
    { ...options, runValidators: true, returnDocument: "after" },
  );
};

export const deleteOne = async ({ model, filter }) => {
  return await model.deleteOne(filter);
};

export const deleteMany = async ({ model, filter }) => {
  return await model.deleteMany(filter);
};

export const findOneAndDelete = async ({ model, filter }) => {
  return await model.findOneAndDelete(filter);
};

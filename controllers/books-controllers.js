import bookModels from "../model/book.js";

export const getBooks = async (req, res, next) => {
  try {
    const bookData = await bookModels.find();
    return res.status(200).send({ books: bookData });
  } catch (error) {
    next(error);
  }
};

export const getBook = async (req, res, next) => {
  try {
    const bookData = await bookModels
      .findById(req.params.id)
      .setOptions({ sanitizeFilter: true });
    !bookData ? res.status(404).send({msg:'Book not found.'}):null
    return res.status(200).send({ book: bookData })
  } catch (error) {
    next(error);
  }
}

export const postBook = async (req, res, next) => {
  try {
    const newBook = new bookModels({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      posted_by: req.body.posted_by,
      location: req.body.location,
      location_description: req.body.location_description
    })
    const dataToSave = await newBook.save()
    return res.status(201).send({book: dataToSave})
  } catch (error) {
    next(error)
  }
}

export const patchBook = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const patchedBook = await bookModels
        .findByIdAndUpdate(_id, req.body, {
          new : true
        })
        .setOptions({ sanitizeFilter: true })
      return res.status(201).send({book: patchedBook})
  } catch (error) {
    next(error)
  }
}
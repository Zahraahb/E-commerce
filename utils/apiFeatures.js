export class ApiFeature {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }
  pagination() {
    let page = this.queryString.page * 1 || 1;
    if (page < 1) {
      page = 1;
    }
    let limit = this.queryString.limit || 10;
    let skip = (parseInt(page) - 1) * limit;
    this.mongooseQuery.find().skip(skip).limit(limit);
    this.page = page
    return this;
  }
  filter() {
    let excludeQuery = ["page", "limit", "sort", "search", "select"];
    let filterQuery = { ...this.queryString };
    excludeQuery.forEach((ele) => delete filterQuery[ele]);
    filterQuery = JSON.parse(
      JSON.stringify(filterQuery).replace(
        /(gt|lt|gte|lte|eq|in)/,
        (match) => `$${match}`
      )
    );
    this.mongooseQuery.find(filterQuery);
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      this.mongooseQuery.sort(this.queryString.sort.replaceAll(",", " "));
    }
    return this;
  }

  select() {
    if (this.queryString.select) {
      this.mongooseQuery.select(this.queryString.select.replaceAll(",", " "));
    }
    return this;
  }

  search() {
    if (this.queryString.search) {
      this.mongooseQuery.find({
        $or: [
          { title: { $regex: this.queryString.search, $options: "i" } },
          { description: { $regex: this.queryString.search, $options: "i" } },
        ],
      });
    }
    return this;
  }
}

var keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Product Model
 * ==========
 */

var Product = new keystone.List('Product', {
	map: { name: 'name' },
	autokey: { path: 'slug', from: 'name', unique: true }
});

Product.add({
	name: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	creator: { type: Types.Relationship, ref: 'User', index: true },
    createdAt: { type: Types.Datetime, default: Date.now, noedit: true },
    publishedAt: { type: Types.Datetime, noedit: true , dependsOn: { state: 'published' }},
	inventory: { type: Types.Number, default: 0 },
	price: { type: Types.Money, default: 39.99 },
	image: { type: Types.CloudinaryImage },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400 }
	},
	categories: { type: Types.Relationship, ref: 'ProductCategory', many: true }
});

Product.schema.virtual('content.full').get(function() {
	return this.content.extended || this.content.brief;
});

Product.schema.methods.isPublished = function() {
    return this.state == 'published';
}

Product.schema.methods.isInStock = function() {
    return this.inventory;
}
 
Product.schema.pre('save', function(next) {
    if (this.isModified('state') && this.isPublished() && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

Product.defaultColumns = 'name, price|10%, state|10%, creator|20%, publishedDate|20%';
Product.register();

const db = require('../modals');
const Product = db.product;
const Category = db.category;
const Order = db.order;
const User = db.user;

const DashboardCount = async (req, res) => {
    try {
        const products = await Product.count();
        const orders = await Order.count();
        const users = await User.count();
        if (products && orders && users) {
            res.status(201).send({
                status: true,
                data: {
                    products: products,
                    orders: orders,
                    users: users,
                },
                message: 'Count Successfull.'
            })
        } else {
            res.status(400).send({
                status: false,
                message: "Bad request."
            })
        }
    } catch (error) {
        res.status(400).send({
            status: false,
            message: "Bad request."
        })
    }
}
const ListProducts = async (req, res) => {
    try {
        const page = req.params['page']
        const ofSet = page ? (page -1) * 10 : 0 ;
        const products = await Product.findAndCountAll({
            limit: 10,
            offset: ofSet,
        });
        if (products) {
            for (let index = 0; index < products.rows.length; index++) {
                const category = await Category.findOne({
                    where: { "id": products.rows[index].category_id }
                })
                products.rows[index].category_id = category
                products.rows[index].images_url = products.rows[index].images_url.split(",")


            }
            res.status(201).send({
                status: true,
                data: products,
                message: "Product Fetched Successfully."
            })
        } else {
            res.status(400).send({
                status: false,
                message: "Bad request."
            })
        }
    } catch (error) {
        console.log(`Error While Fetching Products: ${error}`);
        res.status(401).send({
            status: false,
            message: "Can't Fetch Products!"
        })
    }
}
const AddProduct = async (req, res) => {
    const { name, description, category_id, price, disscount } = req.body;
    const files = req.files;
    const img_Array = [];
    for (let index = 0; index < files.length; index++) {
        img_Array.push(`images/${files[index].filename}`)
    }
    const newArray = img_Array.join();
    const result = await Product.create({
        name: name,
        description: description,
        category_id: parseInt(category_id),
        price: parseInt(price),
        disscount: parseInt(disscount),
        rating: 0,
        ratingList: "",
        images_url: newArray,
    })
    if (result) {
        res.status(201).send({
            status: true,
            response: result,
            message: "Product added successfully."
        })
    }
}

const UpdateProduct = async (req, res) => {
    const { id, name, description, category_id, price, disscount, images } = req.body;
    // console.log(req.files);
    // console.log(req.body);
    const files = req.files;
    const img_Array = [];
    for (let index = 0; index < files.length; index++) {
        img_Array.push(`images/${files[index].filename}`)
    }
    const newImages = [...img_Array, ...images]
    const newArray = newImages.join();
    try {
        if (!id) {
            return res.status(401).send({
                status: false,
                message: `Please enter a valid Id.`
            })
        }
        const result = await Product.findOne({ where: { id: id } });
        if (!result) {
            return res.status(401).send({
                status: false,
                message: `Please enter a valid Id.`
            })
        } else {
            // console.log(newImages);
            const update = await Product.update(
                {
                    name: name ? name : result.name,
                    description: description ? description : result.description,
                    category_id: category_id ? category_id : result.category_id,
                    price: price ? price : result.price,
                    disscount: disscount ? disscount : result.disscount,
                    images_url: newArray,
                },
                { where: { id: id } }
            );
            console.log(update);
            if (update) {
                res.status(201).send({
                    status: true,
                    response: result,
                    message: "Product updated successfully."
                })
            } else {
                res.status(401).send({
                    status: false,
                    message: `Error while Updating Product.`
                })
            }
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while Updating Product: ${error}`
        })
    }
}

const ListCategory = async (req, res) => {
    try {
        const categorys = await Category.findAll();
        if (categorys) {
            res.status(201).send({
                status: true,
                data: categorys,
                message: "Category's Fetched Successfully."
            })
        } else {
            res.status(400).send({
                status: false,
                message: "Bad request."
            })
        }
    } catch (error) {
        console.log(`Error While Fetching Category's: ${error}`);
        res.status(401).send({
            status: false,
            message: "Can't Fetch Category's!"
        })
    }
}

const AddCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.findOne({
            where: { name: name }
        })
        if (category) {
            return res.status(400).send({
                status: false,
                message: "Category Alrerady Exist."
            })
        }
        const result = await Category.create({
            name: name,
        })
        console.log("result==>", result);
        return res.status(201).send({
            status: true,
            response: result,
            message: "Category added successfully."
        })
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while adding Category: ${error}`
        })
    }

}
const UpdateCategory = async (req, res) => {
    const { id, name } = req.body;
    try {
        if (!id) {
            return res.status(401).send({
                status: false,
                message: `Please enter a valid Id.`
            })
        }
        const result = await Category.findOne({ where: { id: id } });
        if (!result) {
            return res.status(401).send({
                status: false,
                message: `Please enter a valid Id.`
            })
        } else {
            const update = await Category.update(
                { name: name ? name : result.name },
                { where: { id: id } }
            );
            if (update) {
                res.status(201).send({
                    status: true,
                    response: result,
                    message: "Category updated successfully."
                })
            } else {
                res.status(401).send({
                    status: false,
                    message: `Error while Updating Category.`
                })
            }
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while Updating Category: ${error}`
        })
    }
}
const DeleteCategory = async (req, res) => {
    const { id } = req.body;
    try {
        if (!id) {
            res.status(401).send({
                status: false,
                message: `Please enter a valid Id.`
            })
        }
        const result = await Category.destroy({ where: { id: id } });
        if (result) {
            return res.status(201).send({
                status: true,
                data: result,
                message: "Category deleted successfully."
            })
        } else {
            res.status(401).send({
                status: false,
                message: `Error while deleting Category.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while Deleting Category: ${error}`
        })
    }
}

const DeleteProduct = async (req, res) => {
    const { id } = req.body;
    try {
        if (!id) {
            res.status(401).send({
                status: false,
                message: `Please enter a valid Id.`
            })
        }
        const result = await Product.destroy({ where: { id: id } });
        if (result) {
            return res.status(201).send({
                status: true,
                data: result,
                message: "Category deleted successfully."
            })
        } else {
            res.status(401).send({
                status: false,
                message: `Error while deleting Category.`
            })
        }
    } catch (error) {
        res.status(401).send({
            status: false,
            message: `Error while Deleting Category: ${error}`
        })
    }
}

const ListUsers = async (req, res) => {
    try {
        const page = req.params['page']
        const ofSet = page ? (page -1) * 10 : 0 ;
        const users = await User.findAndCountAll({
            limit: 10,
            offset: ofSet,
        });
        if (users) {
            res.status(201).send({
                status: true,
                data: users,
                message: "User's Fetched Successfully."
            })
        } else {
            res.status(400).send({
                status: false,
                message: "Bad request."
            })
        }
    } catch (error) {
        console.log(`Error While Fetching User's: ${error}`);
        res.status(401).send({
            status: false,
            message: "Can't Fetch User's!"
        })
    }
}
const fetchOrders = async (req, res) => {
    try {
        const orders = await Order.findAll();
        if (orders) {
            for (let index = 0; index < orders.length; index++) {
                const product = await Product.findOne({ where: { id: orders[index].product_id } })
                product.images_url = product.images_url.split(",")
                orders[index].product_id = product;
            }
            return res.status(201).send({
                status: true,
                data: orders,
                message: 'Orders Fetched Successfully!'
            })
        } else {
            return res.status(401).send({
                status: false,
                message: 'Invalid user Id!'
            })
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({
            status: false,
            message: 'Error While Geting Orders'
        })
    }
}
module.exports = {
    AddProduct,
    ListProducts,
    AddCategory,
    ListCategory,
    DashboardCount,
    DeleteCategory,
    ListUsers,
    DeleteProduct,
    UpdateProduct,
    UpdateCategory,
    fetchOrders,
};
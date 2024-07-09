const User = require('../models/User'); // Make sure the path is correct
// category images store 
const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    // Check if all required fields are provided
    if (!username || !email || !password) {
        return res.status(400).json({ result: false, message: 'username, email, and password are required' });
    }

    try {
        // Check if the user already exists by email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("UserEmail already exists");
            return res.status(201).json({ result: false, message: 'UserEmail already exists' });
        }

        // Create a new user
        const user = new User({ username, email, password });
        await user.save();

        console.log('New User Signup:', { username, email, password });
        res.status(201).json({ result: true, message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Modify the `login` controller to fetch data from MongoDB
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !password) {
        return res.status(400).json({ result: false, message: 'email and password are required' });
    }

    try {
        // Check if the user exists by email and password
        const existingUser = await User.findOne({ email });
        if (existingUser && await existingUser.comparePassword(password)) {
            console.log('Login successfully:', { email });
            res.status(201).json({ result: true, message: 'Login Successfully', res: existingUser });
        } else {
            console.log("User Id Not found");
            return res.status(201).json({ result: false, message: 'User Id Not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// user profile get 
exports.user_profile = async (req, res) => {
    const { _id } = req.body;
    if (!_id) {
        return res.status(400).json({ result: false, message: 'User ID is required' });
    }
    try {
        const user = await User.findById(_id).select('-password');
        if (!user) {
            return res.status(404).json({ result: false, message: 'User not found' });
        }
        res.status(200).json({ result: true, res: user });
    } catch (error) {
        res.status(500).json({ result: false, message: 'User not found' });
    }
};

// Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); // Specify the directory to store the uploaded files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Specify the file name
    }
});

// Initialize upload variable
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('image'); // 'image' is the field name used for the file

// Check file type
function checkFileType(file, cb) {
    // Allowed file types
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Create category
exports.create_category = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ result: false, message: err });
        }

        const { name } = req.body;
        const image = req.file ? req.file.path.split('\\').pop() : null; // Extracting just the image filename

        const existingUser = await Category.findOne({ name });
        if (existingUser) {
            console.log("Category already exists");
            return res.status(201).json({ result: false, message: 'Category already exists' });
        }

        // Check for missing parameters
        if (!name || !image) {
            return res.status(400).json({ result: false, message: 'name and image are required' });
        }

        try {
            const newCategory = new Category({ name, image });
            await newCategory.save();
            res.status(201).json({ result: true, message: 'Category added successfully', category: newCategory });
        } catch (error) {
            console.error(error);
            res.status(500).json({ result: false, message: 'Failed to create category' });
        }
    });
};


// Get category by ID
exports.get_category = async (req, res) => {
    upload(req, res, async (err) => {
        console.log(req)
    })
    try {
        const categories = await Category.find();
        res.status(200).json({ result: true, message: 'Category Get successfully', categories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: false, message: 'Failed to retrieve categories' });
    }
};


// Update category by ID
exports.update_category = async (req, res) => {
    upload(req, res, async (err) => {
        // if (err) {
        //     return res.status(400).json({ result: false, message:"error multer "  });
        // }

        console.log("body", req.body)

        const { _id, name } = req.body;

        if (!_id) {
            return res.status(400).json({ result: false, message: 'Category ID is required' });
        }

        try {
            const category = await Category.findById(_id);
            if (!category) {
                return res.status(404).json({ result: false, message: 'Category not found' });
            }

            const existingUser = await Category.findOne({ name });
            if (existingUser) {
                return res.status(201).json({ result: false, message: 'Category already exists' });
            }

            category.name = name || category.name;
            if (req.file) {
                category.image = req.file.filename;
            }

            await category.save();
            res.status(200).json({ result: true, category });

        } catch (error) {
            res.status(500).json({ result: false, message: 'Failed to update category' });
        }
    });
};


// Delete category by ID
exports.delete_category = async (req, res) => {
    const { _id } = req.body;

    if (!_id) {
        return res.status(400).json({ result: false, message: 'Category _id is required' });
    }

    try {
        const category = await Category.findById(_id);
        if (!category) {
            return res.status(404).json({ result: false, message: 'Category not found' });
        }

        // Get the image path from the category (assuming you have an imagePath field)
        const imagePath = category.imagePath;

        // Delete the category
        await Category.findByIdAndDelete(_id);

        // Delete the image file
        if (imagePath) {
            const imageFullPath = path.resolve(__dirname, '..', 'uploads', imagePath);
            console.log('Attempting to delete image at:', imageFullPath);
            fs.unlink(imageFullPath, (err) => {
                if (err) {
                    console.error('Failed to delete image:', err);
                } else {
                    console.log('Image deleted successfully');
                }
            });
        }

        res.status(200).json({ result: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ result: false, message: 'Failed to delete category' });
    }
};


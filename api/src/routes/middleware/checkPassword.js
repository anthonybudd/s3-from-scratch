const errorHandler = require('./../../providers/errorHandler');
const { User } = require('./../../models');
const bcrypt = require('bcrypt-nodejs');

module.exports = (req, res, next) => {
    if (!req.body.password) return res.status(422).json({
        errors: {
            components: {
                location: 'body',
                param: 'password',
                msg: 'Password must be provided'
            }
        }
    });

    User.unscoped().findOne({ where: { id: req.user.id } }).then(user => {
        if (!user) return res.status(401).json({
            msg: 'Incorrect password',
            code: 92294,
        });

        bcrypt.compare(req.body.password, user.password, (err, compare) => {
            if (err) return res.status(401).json({
                msg: 'Incorrect password',
                code: 96294,
            });

            if (compare) {
                return next();
            } else {
                return res.status(401).json({
                    msg: 'Incorrect password',
                    code: 92298,
                });
            }
        });
    }).catch(err => errorHandler(err, res));
};

module.exports = (req, res, next) => {
    if (!req.user || !req.user.id) return res.status(401).json({
        msg: 'Access error',
        code: 18196,
    });

    if (req.user.id === req.body.userID) return res.status(401).json({
        msg: 'Access error',
        code: 18196,
    });

    return next();
};

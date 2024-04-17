const { Bucket } = require('./../../models');

module.exports = async (req, res, next) => {
    const bucketID = (req.params.bucketID || req.body.bucketID);
    const bucket = await Bucket.findByPk(bucketID);

    if (!bucket) return res.status(404).json({
        msg: `Bucket does not exists.`,
        code: 97924,
    });

    if (req.user.id === bucket.userID) {
        return next();
    } else {
        return res.status(401).json({
            msg: `You do not have access to bucket.id:${bucketID}`,
            code: 49390,
        });
    }
};

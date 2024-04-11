const { User, Group } = require('./../../models');

module.exports = async (req, res, next) => {
    const groupID = (req.params.groupID || req.body.groupID);
    const user = await User.findByPk(req.user.id, {
        include: [Group],
    });

    if (!user) return res.status(401).json({
        msg: `User not found`,
        code: 40120,
    });

    const groups = user.Groups.map(({ id }) => (id));

    if (Array.isArray(groups) && groups.includes(groupID)) {
        return next();
    } else {
        return res.status(401).json({
            msg: `You do not have access to group ${groupID} in [${groups.join(', ')}]`,
            code: 65196,
        });
    }
};

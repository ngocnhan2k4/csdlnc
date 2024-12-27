
function checkRole(requiredRole) {
    return (req, res, next) => {
        if (req.session.userRole && req.session.userRole === requiredRole) {
            return next();
        }
        res.status(403).json({ message: "Không có quyền truy cập!" });
    };
}

module.exports = { checkRole };
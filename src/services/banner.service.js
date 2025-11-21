const Banner = require("../models/banner.model");

const createBanner = async(data)=>{
    const banner = await Banner.create(data);
    return banner;
}

const getAllBanners = async()=>{
    const banners = await Banner.findAll();
    return banners;
}

const getBannerById = async(id)=>{
    const banner = await Banner.findByPk(id);
    return banner;
}

const updateBanner = async(id, data)=>{
    const [updated] = await Banner.update(data, {
        where: { id }
    });
    return updated;
}

const deleteBanner = async(id)=>{
    const deleted = await Banner.destroy({
        where: { id }
    });
    return deleted;
}

module.exports = {
    createBanner,
    getAllBanners,
    getBannerById,
    updateBanner,
    deleteBanner
};

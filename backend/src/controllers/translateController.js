const PageTranslationCache = require("../models/PageTranslationCache");

/**
 * POST /api/translate/on-page
 *
 * body:
 * {
 *      url,
 *      textBlocks:[]
 * }
 */
exports.translateOnPage = async (req, res) => {
    try {

        const { url, textBlocks } = req.body;

        if (!url || !textBlocks) {
            return res.status(400).json({
                success:false,
                message:"Thiếu dữ liệu"
            });
        }

        /**
         * tìm cache
         */

        const cache = await PageTranslationCache.findOne({
            url
        });

        if(cache){

            return res.json({
                success:true,
                cached:true,
                overlays:cache.overlays
            });

        }

        /**
         * TODO
         * Gọi AI Translate
         */

        const overlays = textBlocks.map(item=>({

            bbox:item.bbox,

            originalText:item.text,

            translatedText:item.text,

            backgroundColor:"#FFFFFF",

            fontSizeHint:16

        }));

        await PageTranslationCache.create({

            url,

            overlays

        });

        res.json({

            success:true,

            cached:false,

            overlays

        });

    } catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }
}
// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{   
    const COLOR_MAX = 255
    
    // console.log("Before:")
    // console.log(bgImg)

    for (let xFg = 0; xFg < fgImg.width; xFg++) {
        for (let yFg = 0; yFg < fgImg.height; yFg++) {

            // Which bg pixel to change
            const xBg = xFg + fgPos.x
            const yBg = yFg + fgPos.y

            // We can only change pixels inside the bg image
            const isIntersecting = (xBg >= 0 && xBg < bgImg.width) && (yBg >= 0 && yBg < bgImg.height)
            if (!isIntersecting) {
                continue
            }

            // indices of individual RGBA values in the data arrays of bg and fg images
            const fgIdx = (yFg * fgImg.width + xFg) * 4
            const bgIdx = (yBg * bgImg.width + xBg) * 4

            const fgAlphaNorm = normalize(fgImg.data[fgIdx + 3]  * fgOpac, COLOR_MAX)
            let bgAlpha = bgImg.data[bgIdx + 3]
            const bgAlphaNorm = normalize(bgAlpha, COLOR_MAX)

            for (let i = 0; i < 3; i++) {
                const fgChannelNorm = normalize(fgImg.data[fgIdx + i], COLOR_MAX)
                const bgChannelNorm = normalize(bgImg.data[bgIdx + i], COLOR_MAX)
                const { outChannel, outAlpha } = alphaBlend(fgChannelNorm, fgAlphaNorm, bgChannelNorm, bgAlphaNorm)
                bgImg.data[bgIdx + i] = outChannel * COLOR_MAX
                bgAlpha = outAlpha * COLOR_MAX
                //console.log(`fgChannel: ${fgChannelNorm}, fgAlpha: ${fgAlphaNorm}, bgChannel: ${bgChannelNorm}, bgAlpha: ${bgAlphaNorm}, alphaBlend: ${bgImg.data[iFg + i]}`)
            }
            bgImg.data[bgIdx + 3] = bgAlpha
        }
    }
    // console.log("After:")
    // console.log(bgImg)
}

function alphaBlend(fgChannel, fgAlpha, bgChannel, bgAlpha) {
    const outAlpha = fgAlpha + (1 - fgAlpha) * bgAlpha
    const outChannel = (fgAlpha * fgChannel + (1 - fgAlpha) * bgAlpha * bgChannel) / outAlpha
    return { outChannel, outAlpha }
}

function normalize(channel, maxValue) {
    return channel / maxValue
}

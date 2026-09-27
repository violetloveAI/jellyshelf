import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// Original JellyShelf four-petal mark; contains no third-party product photography.
func image(size: Int, flowerScale: CGFloat, path: String) throws {
    // An opaque Core Graphics surface also works in headless build environments.
    let context = CGContext(data: nil, width: size, height: size,
        bitsPerComponent: 8, bytesPerRow: size * 4,
        space: CGColorSpace(name: CGColorSpace.sRGB)!,
        bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
    context.setFillColor(CGColor(red: 248/255, green: 243/255, blue: 235/255, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: size, height: size))
    context.translateBy(x: CGFloat(size)/2, y: CGFloat(size)/2)
    context.rotate(by: .pi / 15)
    context.scaleBy(x: flowerScale, y: flowerScale)
    context.setFillColor(CGColor(red: 157/255, green: 76/255, blue: 53/255, alpha: 1))
    for x in [-155.0, 155.0] {
        for y in [-155.0, 155.0] {
            context.fillEllipse(in: CGRect(x: x-200, y: y-200, width: 400, height: 400))
        }
    }
    context.setFillColor(CGColor(red: 228/255, green: 203/255, blue: 170/255, alpha: 1))
    context.fillEllipse(in: CGRect(x: -55, y: -55, width: 110, height: 110))
    let destination = CGImageDestinationCreateWithURL(URL(fileURLWithPath: path) as CFURL,
        UTType.png.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(destination, context.makeImage()!, nil)
    guard CGImageDestinationFinalize(destination) else {
        throw CocoaError(.fileWriteUnknown)
    }
}

let root = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "."
try image(size: 1024, flowerScale: 0.83,
    path: "\(root)/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")
for filename in ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"] {
    try image(size: 2732, flowerScale: 0.42,
        path: "\(root)/ios/App/App/Assets.xcassets/Splash.imageset/\(filename)")
}

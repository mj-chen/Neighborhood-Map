const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Webpack= require('webpack')
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin')
module.exports={
    devServer:{
        open:true,
    },

    module:{
        rules:[
            {
                test:/\.js$/,
                use:['babel-loader']
            },
            {
                test:/\.css$/,
                use:[
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test:/\.html$/,
                use:['html-loader']
            },
            {
                test:/\.(jpg|png)$/,
                use:{
                    loader:'file-loader',
                    options:{
                        name:'[name].[ext]',
                        outputPath:'img/',
                        publicPath:'img/'
                    }
                }
            }
        ]
    },
    plugins:[
        new Webpack.ProvidePlugin({
            $:'jquery',
            jquery:'jquery',
            ko:'knockout'
        }),
        new MiniCssExtractPlugin({
            filename:'[name].css'
        }),
        new HtmlWebpackPlugin({
            template:'src/index.html'
        })
    ],
    optimization:{
        minimizer:[new UglifyWebpackPlugin({sourceMap:true})]
    }
}
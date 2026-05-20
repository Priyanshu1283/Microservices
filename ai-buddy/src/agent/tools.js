const {tool} = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require("axios");
  


const searchProducts = tool(async (data)=> {


 
},
name="search-products",
description="Search for products based on a query",
inputSchema = z.object({
    query: z.string().describe("The search query for products")
})
)
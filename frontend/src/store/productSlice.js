import { createSlice,isRejectedWithValue,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../lib/axios";
import toast from "react-hot-toast";
//isRejected with value doesn't work rejectwithvalue le matrai hunxa

export const fetchAllProducts = createAsyncThunk(
    "products/fetchAll",
    async(_ , {isRejectedWithValue}) => {
        try {
            const response = await axios.get("/products")
            return response.data.products
        } catch (error) {
            toast.error(error.response?.data.error || "Failed to fetch products")
            return isRejectedWithValue("Failed to fetch products")
        }
    }
)

export const fetchProductsByCategory = createAsyncThunk(
    "products/fetchByCategory",
    async(category ,{isRejectedWithValue}) => {
        try {
            const response = await axios.get(`/products/category/${category}`)
            return response.data.products
        } catch (error) {
            toast.error(error.response?.data?.error || "Failes to fetch products")
            return isRejectedWithValue("failed to fetch products")
        }
    }
)

export const fetchFeaturedProducts = createAsyncThunk(
    "products/fetchFeatured",
    async(_ , {isRejectedWithValue})=>{
        try {
            const response = await axios.get("/products/featured")
            return response.data   
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to fetch by featured")
            return isRejectedWithValue("failed to fetch products")
        }
        
    }
)

export const createProduct = createAsyncThunk(
    "products/create",
    async(productData , {rejectWithValue}) => {
        console.log(productData)
        try {
           const response = await axios.post("/products",productData) 
           return response.data
        } catch (error) {
            toast.error("Failed to create product")
            return  rejectWithValue(error.response?.data || {message: error.message})
        }
    }
)

export const deleteProduct = createAsyncThunk(
    "products/delete",
    async(productId,{isRejectedWithValue})=>{
        try {
            await axios.delete(`/products/${productId}`)
            toast.success("Item deleted")
            return productId
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to delete product")
            return isRejectedWithValue("Failed to delete product")
        }
    }
)

export const toggleFeaturedProduct = createAsyncThunk(
    "products/toggleFeatured",
    async(productId,{isRejectedWithValue}) => {
        try {
            const response = await axios.patch(`/products/${productId}`)
            return { productId,isFeatured:response.data.isFeatured} 
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to update product")
            return isRejectedWithValue("Failed to update product")
        }
    }
)

const initialState = {
    products: [],
    loading:false,
    error:null,
}

const productSlice = createSlice({
    name:"products",
    initialState,
    reducers:{
        setProducts: (state,action)=> {
            state.products = action.payload
        }
    },
    extraReducers:(builder) => {
        builder 
        //fetchallproducts
        .addCase(fetchAllProducts.pending, (state) => {
				state.loading = true
			})
			.addCase(fetchAllProducts.fulfilled, (state, action) => {
				state.products = action.payload
				state.loading = false
			})
			.addCase(fetchAllProducts.rejected, (state) => {
				state.loading = false
			})

			// fetchProductsByCategory
			.addCase(fetchProductsByCategory.pending, (state) => {
				state.loading = true
			})
			.addCase(fetchProductsByCategory.fulfilled, (state, action) => {
				state.products = action.payload;
				state.loading = false
			})
			.addCase(fetchProductsByCategory.rejected, (state) => {
				state.loading = false
			})

			// fetchFeaturedProducts
			.addCase(fetchFeaturedProducts.pending, (state) => {
				state.loading = true
			})
			.addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
				state.products = action.payload
				state.loading = false
			})
			.addCase(fetchFeaturedProducts.rejected, (state) => {
				state.loading = false
			})

			// createProduct
			.addCase(createProduct.pending, (state) => {
				state.loading = true
			})
			.addCase(createProduct.fulfilled, (state, action) => {
				state.products.push(action.payload)
				state.loading = false
			})
			.addCase(createProduct.rejected, (state) => {
				state.loading = false
			})

			// deleteProduct
			.addCase(deleteProduct.pending, (state) => {
				state.loading = true
			})
			.addCase(deleteProduct.fulfilled, (state, action) => {
				state.products = state.products.filter((p) => p._id !== action.payload)
				state.loading = false
			})
			.addCase(deleteProduct.rejected, (state) => {
				state.loading = false
			})

			// toggleFeaturedProduct
			.addCase(toggleFeaturedProduct.pending, (state) => {
				state.loading = true
			})
			.addCase(toggleFeaturedProduct.fulfilled, (state, action) => {
				const { productId, isFeatured } = action.payload
				state.products = state.products.map((product) =>
					product._id === productId ? { ...product, isFeatured } : product
				)
				state.loading = false
			})
			.addCase(toggleFeaturedProduct.rejected, (state) => {
				state.loading = false
			})
	}
})

export const {setProducts} = productSlice.actions
export default productSlice.reducer
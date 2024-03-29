import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit';

import { Api, initialApiStatus, handleValidateResponse } from '../../api/api';
import { Credential, Tag } from '../../api/model';
import { RootState } from '../../app/store';


const tagAdapter = createEntityAdapter<Tag>({
  selectId: tag => tag.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

const initialState = tagAdapter.getInitialState(initialApiStatus);

export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (credential: Credential) => {
    const response = await Api.getAll(credential, 'tags');
    return handleValidateResponse(200, response);
  }
);

export const createTag = createAsyncThunk(
  'tags/addTag',
  async (params: { credential: Credential, tag: Tag }) => {
    const { credential, tag } = params;
    const response = await Api.create(credential, 'tags', tag);
    return handleValidateResponse(201, response);
  }
);

export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async (params: { credential: Credential, id: number, tag: Tag }) => {
    const { credential, id, tag } = params;
    const response = await Api.updateById(credential, 'tags', id, tag);
    return handleValidateResponse(200, response);
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (params: { credential: Credential, id: number }) => {
    const { credential, id } = params;
    const response = await Api.deleteById(credential, 'tags', id);
    response.data = { id };
    return handleValidateResponse(204, response);
  }
);

const tagsSlice = createSlice(
  {
    name: 'tags',
    initialState,
    reducers: {},
    extraReducers(builder) {
      builder
        // fetch
        .addCase(fetchTags.pending, (state, action) => {
          state.status = 'loading';
        })
        .addCase(fetchTags.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.error = undefined;
          tagAdapter.upsertMany(state, action.payload.data);
        })
        .addCase(fetchTags.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        })
        // create
        .addCase(createTag.pending, (state, action) => {
          state.status = 'loading';
        })
        .addCase(createTag.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.error = undefined;
          tagAdapter.addOne(state, action.payload.data);
        })
        .addCase(createTag.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        })
        // update
        .addCase(updateTag.pending, (state, action) => {
          state.status = 'loading';
        })
        .addCase(updateTag.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.error = undefined;
          tagAdapter.upsertOne(state, action.payload.data);
        })
        .addCase(updateTag.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        })
        // delete
        .addCase(deleteTag.pending, (state, action) => {
          state.status = 'loading';
        })
        .addCase(deleteTag.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.error = undefined;
          tagAdapter.removeOne(state, action.payload.id);
        })
        .addCase(deleteTag.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        })
    }
  }
);

export const {
  selectAll: selectAllTags,
  selectById: selectTagById,
  selectIds: selectTagsIds
} = tagAdapter.getSelectors((state: RootState) => state.tags);

export const selectTagsStatus = (state: RootState) => state.tags.status;
export const selectTagsError = (state: RootState) => state.tags.error;

export const tagsReducer = tagsSlice.reducer;

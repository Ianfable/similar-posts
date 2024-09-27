import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    InspectorControls,
    useBlockProps,
    BlockControls,
} from '@wordpress/block-editor';
import { PanelBody, RangeControl, Spinner, Placeholder, CheckboxControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

registerBlockType('similar-posts/block', {
    title: __('Similar posts', 'similar-posts-plugin'),
    icon: 'admin-post',
    category: 'widgets',

    attributes: {
        postsToShow: {
            type: 'number',
            default: 2,
        },
        displayAsList: {
            type: 'boolean',
            default: false,
        },
    },

    edit: ({ attributes, setAttributes }) => {
        const { postsToShow, displayAsList } = attributes;
        const blockProps = useBlockProps();

        // Dobijanje trenutne objave
        const currentPostId = wp.data.select('core/editor').getCurrentPostId();

        // Dohvatanje sličnih objava
        const similarPosts = useSelect(
            (select) => {
                const { getEntityRecords } = select('core');
                const { getEditedPostAttribute } = select('core/editor');

                const categories = getEditedPostAttribute('categories');

                if (!categories || categories.length === 0) {
                    return [];
                }

                return getEntityRecords('postType', 'post', {
                    per_page: postsToShow,
                    exclude: [currentPostId],
                    categories,
                });
            },
            [postsToShow]
        );

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Settings', 'similar-posts-plugin')}>
                        <RangeControl
                            label={__('Number of posts to display', 'similar-posts-plugin')}
                            value={postsToShow}
                            onChange={(value) => setAttributes({ postsToShow: value })}
                            min={1}
                            max={4}
                        />
                        <CheckboxControl
                            label={__('Display as list', 'similar-posts-plugin')}
                            checked={displayAsList}
                            onChange={(value) => setAttributes({ displayAsList: value })}
                        />
                    </PanelBody>
                </InspectorControls>

                {similarPosts ? (
                    similarPosts.length > 0 ? (
                        <ul {...blockProps}>
                            {similarPosts.map((post) => (
                                <li key={post.id}>
                                    <a href={post.link}>{post.title.rendered}</a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Placeholder>
                            {__('No related posts to display.', 'similar-posts-plugin')}
                        </Placeholder>
                    )
                ) : (
                    <Spinner />
                )}
            </>
        );
    },

    save: () => {
        return null; 
    },
});

<?php
/**
 * Plugin Name: Similar Posts Plugin
 * Description: Dodaje Gutenberg blok za prikaz sličnih objava.
 * Version: 1.0.0
 * Author: Marko Janković
 */

function similar_posts_block_init() {
    wp_register_script(
        'similar-posts-block-editor',
        plugins_url( 'build/index.js', __FILE__ ),
        array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n', 'wp-block-editor' ),
        filemtime( plugin_dir_path( __FILE__ ) . 'build/index.js' )
    );

    // Enqueue front-end stilova iz css/style.css
    wp_register_style(
        'similar-posts-block-style',
        plugins_url( 'css/style.css', __FILE__ ),
        array(),
        filemtime( plugin_dir_path( __FILE__ ) . 'css/style.css' )
    );

    register_block_type( 'similar-posts/block', array(
        'editor_script'   => 'similar-posts-block-editor',
        'style'           => 'similar-posts-block-style',
        'render_callback' => 'similar_posts_render_callback',
        'attributes'      => array(
            'postsToShow' => array(
                'type'    => 'number',
                'default' => 2,
            ),
        ),
    ) );
}
add_action( 'init', 'similar_posts_block_init' );

function similar_posts_render_callback( $attributes ) {
    global $post;

    if ( ! $post ) {
        return __( 'Currently, there is no content to display related posts.', 'similar-posts-plugin' );
    }

    $posts_to_show = isset( $attributes['postsToShow'] ) ? intval( $attributes['postsToShow'] ) : 2;
    $display_as_list = isset( $attributes['displayAsList'] ) ? (bool) $attributes['displayAsList'] : false;

    if ( $posts_to_show < 1 || $posts_to_show > 4 ) {
        $posts_to_show = 2;
    }

    $categories = wp_get_post_terms( $post->ID, 'category', array( 'fields' => 'ids' ) );

    if ( empty( $categories ) ) {
        return __( 'This post has no categories', 'similar-posts-plugin' );
    }

    $args = array(
        'post_type'      => 'post',
        'posts_per_page' => $posts_to_show,
        'post__not_in'   => array( $post->ID ),
        'tax_query'      => array(
            array(
                'taxonomy' => 'category',
                'field'    => 'term_id',
                'terms'    => $categories,
            ),
        ),
    );

    $similar_posts = new WP_Query( $args );

    if ( ! $similar_posts->have_posts() ) {
        return __( 'There are no related posts to display', 'similar-posts-plugin' );
    }

    // Generisanje izlaza u zavisnosti od vrednosti atributa displayAsList
    if ( $display_as_list ) {
        $output = '<ul class="similar-posts-list">';
        while ( $similar_posts->have_posts() ) {
            $similar_posts->the_post();
            $title = esc_html( get_the_title() );
            $permalink = get_permalink();
            $output .= '<li><a href="' . $permalink . '">' . $title . '</a></li>';
        }
        $output .= '</ul>';
    } else {
        $output = '<div class="similar-posts-cards posts-count-' . $posts_to_show . '">';
        while ( $similar_posts->have_posts() ) {
            $similar_posts->the_post();
            $thumbnail = get_the_post_thumbnail( get_the_ID(), 'medium', array( 'class' => 'similar-posts-thumbnail' ) );
            $title = esc_html( get_the_title() );
            $permalink = get_permalink();

            $output .= '
            <div class="similar-post-card">
                <a href="' . $permalink . '" class="similar-post-link">
                    <div class="similar-post-thumbnail">
                        ' . $thumbnail . '
                    </div>
                    <div class="similar-post-content">
                        <h4 class="similar-post-title">' . $title . '</h4>
                    </div>
                </a>
            </div>';
        }
        $output .= '</div>';
    }

    wp_reset_postdata();

    return $output;
}



function similar_posts_plugin_load_textdomain() {
    load_plugin_textdomain( 'similar-posts-plugin', false, basename( dirname( __FILE__ ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'similar_posts_plugin_load_textdomain' );

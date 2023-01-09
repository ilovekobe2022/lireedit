import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Box, Button, Flex, Heading, Link, Stack,Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from 'react';

const Index = () => {
  const [variables,setVariables] = useState({ 
    limit: 10, 
    cursor: null as null | string, 
  });
  const [{ data,fetching }] = usePostsQuery({
    variables,
});

  if (!fetching && !data) {
    return <div>you got query failed for some reason </div>
  }

  return(
    <Layout>
      <Flex align="center">
        <Heading>LiReddit</Heading>
        <Link ml="auto" as={NextLink} href="/create-post">create post</Link>
      </Flex>
      <br />
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
        {data!.posts.map((p) => (
          <Box key={p.id} p={5} shadow='md' borderWidth='1px'>
            <Heading fontSize='xl'>{p.title}</Heading>
            <Text mt={4}>{p.textSnippet}</Text>
          </Box>
        ))}
        </Stack>
      )}
      {data ? (
      <Flex>
        <Button onClick={() => {
          setVariables({
            limit: variables.limit,
            cursor: data.posts[data.posts.length -1].createdAt,
          })
        }}
        isLoading={fetching} m="auto" my={8}>
          load more
          </Button>
      </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Index);
